mod models;
mod responses;

use crate::{models::*, responses::*};

use actix_files::NamedFile;
use actix_web::{
    dev::ServiceResponse, error::ErrorInternalServerError, error::ErrorNotFound,
    http::header::HeaderName, http::header::HeaderValue, http::StatusCode, middleware::Compress,
    middleware::DefaultHeaders, middleware::ErrorHandlerResponse, middleware::ErrorHandlers,
    middleware::Logger, web, App, HttpServer, Result,
};
use serde::Deserialize;
use std::{fs, io, path::Path};
use tera::{Context, Tera};

#[derive(Deserialize, Debug, Default, Clone)]
pub struct Config {
    #[serde(default)]
    pub source_maps: bool,
    #[serde(default = "default_port")]
    pub port: u16,
    #[serde(default = "default_targets")]
    pub targets: String,
}

fn default_port() -> u16 {
    8080
}

fn default_targets() -> String {
    String::from("supports es6-module and last 2 versions")
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::init();
    fs::remove_dir_all("storage/cache").ok();

    let config = envy::from_env::<Config>().unwrap_or_default();
    let port = config.port;

    HttpServer::new(move || {
        let site = Site::get();
        let tera = Tera::new("templates/**/*").expect("templates parsing failed");

        App::new()
            .app_data(web::Data::new(config.to_owned()))
            .app_data(web::Data::new(site))
            .app_data(web::Data::new(tera))
            .wrap(Logger::new("%s %r"))
            .wrap(DefaultHeaders::new().add(("Content-Security-Policy", "default-src 'self'")))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, not_found))
            .wrap(ErrorHandlers::new().handler(StatusCode::INTERNAL_SERVER_ERROR, internal_error))
            .wrap(Compress::default())
            .route("/", web::get().to(home))
            .route("/posts.rss", web::get().to(posts_rss))
            .route("/posts/{slug:.*?}.html", web::get().to(post))
            .route("/{file:.*?}", web::get().to(asset))
    })
    .bind(format!("0.0.0.0:{port}"))?
    .run()
    .await
}

fn not_found<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let title = "Page Not Found".to_string();
    let message = "That resource was moved, removed, or never existed.".to_string();
    let req = res.request();
    let site = match req.app_data::<web::Data<Site>>() {
        Some(s) => s.as_ref().to_owned(),
        None => Site::default(),
    };
    let tmpl = req.app_data::<web::Data<Tera>>();

    let mut body = "".to_string();

    if let Some(t) = tmpl {
        let mut ctx = Context::new();
        ctx.insert("site", &site);
        ctx.insert("title", &title);
        ctx.insert("message", &message);

        if let Ok(b) = t.render("error.html", &ctx) {
            body = b
        }
    }

    error_response(res, body)
}

fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let title = "Internal Error".to_string();
    let message = "An error occurred. Please try again later.".to_string();
    let req = res.request();
    let site = match req.app_data::<web::Data<Site>>() {
        Some(s) => s.as_ref().to_owned(),
        None => Site::default(),
    };
    let tmpl = req.app_data::<web::Data<Tera>>();

    let mut body = "".to_string();

    if let Some(t) = tmpl {
        let mut ctx = Context::new();
        ctx.insert("site", &site);
        ctx.insert("title", &title);
        ctx.insert("message", &message);

        if let Ok(b) = t.render("error.html", &ctx) {
            body = b
        }
    }

    error_response(res, body)
}

fn error_response<B>(res: ServiceResponse<B>, body: String) -> Result<ErrorHandlerResponse<B>> {
    let (req, res) = res.into_parts();
    let res = res.set_body(body);
    let mut res = ServiceResponse::new(req, res)
        .map_into_boxed_body()
        .map_into_right_body();
    let headers = res.headers_mut();

    headers.insert(
        HeaderName::from_static("content-type"),
        HeaderValue::from_static("text/html; charset=utf-8"),
    );

    let res = ErrorHandlerResponse::Response(res);

    Ok(res)
}

async fn home(site: web::Data<Site>, tmpl: web::Data<tera::Tera>) -> Result<NamedFile> {
    cacheable_response(Path::new("index.html"), || {
        let posts = Post::get_all();

        match !posts.is_empty() {
            true => {
                let mut ctx = Context::new();
                ctx.insert("site", &site.as_ref());
                ctx.insert("title", &"Home".to_string());
                ctx.insert("posts", &Post::get_all());
                tmpl.render("home.html", &ctx)
                    .map_err(ErrorInternalServerError)
            }
            false => Err(ErrorNotFound("not found")),
        }
    })
}

async fn posts_rss(site: web::Data<Site>, tmpl: web::Data<tera::Tera>) -> Result<NamedFile> {
    cacheable_response(Path::new("posts.rss"), || {
        let mut ctx = Context::new();
        ctx.insert("site", &site.as_ref());
        ctx.insert("posts", &Post::get_all());
        tmpl.render("posts.rss", &ctx)
            .map_err(ErrorInternalServerError)
    })
}

async fn post(
    slug: web::Path<String>,
    site: web::Data<Site>,
    tmpl: web::Data<tera::Tera>,
) -> Result<NamedFile> {
    let slug = slug.as_ref();
    let path = Path::new("posts").join(slug).with_extension("html");

    cacheable_response(&path, || {
        let post = Post::get_by_slug(slug.to_string());

        match post {
            Some(post) => {
                let mut ctx = Context::new();
                ctx.insert("site", &site.as_ref());
                ctx.insert("title", &post.title.clone());
                ctx.insert("components", &post.components.clone());
                ctx.insert("post", &post);
                tmpl.render("post.html", &ctx)
                    .map_err(ErrorInternalServerError)
            }
            None => Err(ErrorNotFound("not found")),
        }
    })
}

async fn asset(file: web::Path<String>, config: web::Data<Config>) -> Result<NamedFile> {
    let src = Path::new("assets").join(file.to_string());
    let ext_str = src.extension().and_then(|ext| ext.to_str()).unwrap_or("");

    match ext_str {
        "js" => js_response(src, config),
        "css" => css_response(src, config),
        _ => asset_response(src),
    }
}
