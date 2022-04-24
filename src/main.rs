mod assets;
mod common;
mod service;

use actix_web::{
    dev::ServiceResponse,
    http::{
        header::{HeaderName, HeaderValue},
        StatusCode,
    },
    middleware::{Compress, ErrorHandlerResponse, ErrorHandlers, Logger},
    web, App, HttpServer, Result,
};
use std::io;

#[actix_web::main]
async fn main() -> io::Result<()> {
    use dotenv::dotenv;
    use std::fs;

    dotenv().expect("failed to read .env file");

    env_logger::init();

    fs::remove_dir_all("storage/cache").ok();

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::new("%s %r"))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, not_found))
            .wrap(ErrorHandlers::new().handler(StatusCode::INTERNAL_SERVER_ERROR, internal_error))
            .wrap(Compress::default())
            .route("/health", web::get().to(health))
            .configure(service::configure)
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}

async fn health() -> Result<String> {
    Ok("OK".to_string())
}

fn not_found<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    error_response(res, service::not_found())
}

fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    error_response(res, service::internal_error())
}

fn error_response<B>(
    res: ServiceResponse<B>,
    body: Result<String, common::CustomError>,
) -> Result<ErrorHandlerResponse<B>> {
    let body = body.expect("failed to produce body");
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
