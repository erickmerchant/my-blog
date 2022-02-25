mod assets;
mod common;
mod minefield;
mod pages;
mod service;
mod templates;

use actix_web::{
    dev::ServiceResponse,
    http::header::{HeaderName, HeaderValue},
    http::StatusCode,
    middleware::ErrorHandlerResponse,
    middleware::{Compress, ErrorHandlers, Logger},
    App, HttpServer, Result,
};
use maud::Markup;
use std::{env, io};

#[cfg(feature = "local")]
#[actix_web::main]
async fn main() -> io::Result<()> {
    use dotenv::dotenv;
    use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
    use std::fs;

    dotenv().expect("failed to read .env file");

    env_logger::init();

    fs::remove_dir_all("storage/cache").ok();

    let mut ssl_builder = SslAcceptor::mozilla_intermediate(SslMethod::tls())?;

    ssl_builder.set_private_key_file(
        env::var("SSL_KEY").expect("failed to read env variable SSL_KEY"),
        SslFiletype::PEM,
    )?;
    ssl_builder.set_certificate_chain_file(
        env::var("SSL_CERT").expect("failed to read env variable SSL_CERT"),
    )?;

    let port = env::var("PORT").expect("failed to read env variable PORT");

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::new("%s %r"))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, not_found))
            .wrap(ErrorHandlers::new().handler(StatusCode::INTERNAL_SERVER_ERROR, internal_error))
            .wrap(Compress::default())
            .configure(service::configure)
    })
    .bind_openssl(format!("0.0.0.0:{port}"), ssl_builder)?
    .run()
    .await
}

#[cfg(not(feature = "local"))]
#[actix_web::main]
async fn main() -> io::Result<()> {
    let port = env::var("PORT").expect("failed to read env variable PORT");

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::new("%s %r"))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, not_found))
            .wrap(ErrorHandlers::new().handler(StatusCode::INTERNAL_SERVER_ERROR, internal_error))
            .wrap(Compress::default())
            .configure(service::configure)
    })
    .bind(format!("0.0.0.0:{port}"))?
    .run()
    .await
}

fn not_found<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    error_response(res, templates::not_found())
}

fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    error_response(res, templates::internal_error())
}

fn error_response<B>(res: ServiceResponse<B>, src: Markup) -> Result<ErrorHandlerResponse<B>> {
    let body = common::minify_markup(src).expect("body minified");
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
