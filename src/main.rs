mod models;
mod responses;
mod views;

use crate::{models::*, responses::*, views::*};

use actix_files::NamedFile;
use actix_web::{
    dev::ServiceResponse, error::ErrorNotFound, http::header::HeaderName,
    http::header::HeaderValue, http::StatusCode, middleware::Compress,
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
    let req = res.request();
    let site = match req.app_data::<web::Data<Site>>() {
        Some(s) => s.as_ref().to_owned(),
        None => Site::default(),
    };

    error_response(res, NotFoundView { site, title })
}

fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let title = "Internal Error".to_string();
    let req = res.request();
    let site = match req.app_data::<web::Data<Site>>() {
        Some(s) => s.as_ref().to_owned(),
        None => Site::default(),
    };

    error_response(res, InternalErrorView { site, title })
}

fn error_response<B>(
    res: ServiceResponse<B>,
    body: impl UnminifiedView,
) -> Result<ErrorHandlerResponse<B>> {
    let body = body.to_result()?;
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
    cacheable_response(Path::new("index.html"), || {
        let site = site.as_ref().to_owned();
        let posts = Post::get_all();
        let title = "Home".to_string();

        match posts.len() > 1 {
            true => HomeView { site, title, posts }.to_result(),
            false => match posts.get(0) {
                Some(post) => PostView {
                    site,
                    title,
                    post: post.to_owned(),
                }
                .to_result(),
                None => Err(ErrorNotFound("not found")),
            },
        }
    })
}

async fn posts_rss(site: web::Data<Site>) -> Result<NamedFile> {
    cacheable_response(Path::new("posts.rss"), || {
        let site = site.as_ref().to_owned();
        let posts = Post::get_all();

        FeedView { site, posts }.to_result()
    })
}

async fn post(slug: web::Path<String>, site: web::Data<Site>) -> Result<NamedFile> {
    let site = site.as_ref();
    let slug = Path::new(slug.as_ref().as_str()).with_extension("");
    let slug = slug.to_str().expect("invalid slug");
    let path = Path::new("content/posts").join(slug).with_extension("html");

    cacheable_response(&path, || {
        let post = Post::get_by_path(path.to_owned());

        match post {
            Some(post) => PostView {
                site: site.to_owned(),
                title: post.title.clone(),
                post,
            }
            .to_result(),
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
