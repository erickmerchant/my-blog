mod models;
mod responses;
mod views;

use crate::{models::*, responses::*, views::*};

use actix_files::NamedFile;
use actix_web::{
    dev::ServiceResponse, error::ErrorNotFound, http::header::HeaderName,
    http::header::HeaderValue, http::StatusCode, middleware::Compress, middleware::DefaultHeaders,
    middleware::ErrorHandlerResponse, middleware::ErrorHandlers, middleware::Logger, web, App,
    HttpServer, Result,
};
use serde::Deserialize;
use std::{fs, io, path::Path};

#[derive(Deserialize, Debug, Default, Clone, Copy)]
struct Config {
    #[serde(default)]
    source_maps: bool,
    #[serde(default = "default_port")]
    port: u16,
}

fn default_port() -> u16 {
    8080
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::init();

    fs::remove_dir_all("storage/cache").ok();

    let config = envy::from_env::<Config>().unwrap_or_default();
    let port = config.port;

    HttpServer::new(move || {
        let site = Site::get();

        App::new()
            .app_data(web::Data::new(config))
            .app_data(web::Data::new(site))
            .wrap(Logger::new("%s %r"))
            .wrap(DefaultHeaders::new().add(("Content-Security-Policy", "default-src 'self'")))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, not_found))
            .wrap(ErrorHandlers::new().handler(StatusCode::INTERNAL_SERVER_ERROR, internal_error))
            .wrap(Compress::default())
            .route("/", web::get().to(home))
            .route("/posts.rss", web::get().to(posts_rss))
            .route("/posts/{slug:.*.html}", web::get().to(post))
            .route("/{file:.*?}", web::get().to(file))
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

    error_response(
        res,
        ErrorView {
            site,
            title,
            message,
        }
        .to_string(),
    )
}

fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let title = "Internal Error".to_string();
    let message = "An error occurred. Please try again later.".to_string();
    let req = res.request();
    let site = match req.app_data::<web::Data<Site>>() {
        Some(s) => s.as_ref().to_owned(),
        None => Site::default(),
    };

    error_response(
        res,
        ErrorView {
            site,
            title,
            message,
        }
        .to_string(),
    )
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

async fn home(site: web::Data<Site>) -> Result<NamedFile> {
    html_response(Path::new("index.html"), || {
        let site = site.as_ref().to_owned();
        let posts = Post::get_all();
        let title = "Home".to_string();

        match !posts.is_empty() {
            true => Ok(HomeView { site, title, posts }.to_string()),
            false => Err(ErrorNotFound("not found")),
        }
    })
}

async fn posts_rss(site: web::Data<Site>) -> Result<NamedFile> {
    cacheable_response(Path::new("posts.rss"), || {
        let site = site.as_ref().to_owned();
        let posts = Post::get_all();

        Ok(FeedView { site, posts }.to_string())
    })
}

async fn post(slug: web::Path<String>, site: web::Data<Site>) -> Result<NamedFile> {
    let site = site.as_ref();
    let slug = Path::new(slug.as_ref().as_str()).with_extension("");
    let slug = slug.to_str().expect("invalid slug");
    let path = Path::new("content/posts").join(slug).with_extension("html");

    html_response(&path, || {
        let post = Post::get_by_slug(slug.to_string());
        let site = site.to_owned();

        match post {
            Some(post) => {
                let title = post.title.clone();

                Ok(PostView { site, title, post }.to_string())
            }
            None => Err(ErrorNotFound("not found")),
        }
    })
}

async fn file(file: web::Path<String>, data: web::Data<Config>) -> Result<NamedFile> {
    let src = Path::new("assets").join(file.to_string());
    let ext_str = if let Some(ext) = src.extension().and_then(|ext| ext.to_str()) {
        ext
    } else {
        ""
    };

    match ext_str {
        "js" => js_response(src, data.source_maps),
        "css" => css_response(src, data.source_maps),
        _ => static_response(src),
    }
}
