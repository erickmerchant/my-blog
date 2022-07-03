mod assets;
mod common;
mod models;
mod routes;
mod views;

use actix_web::{
    dev::ServiceResponse,
    http::{
        header::{HeaderName, HeaderValue},
        StatusCode,
    },
    middleware::{Compress, ErrorHandlerResponse, ErrorHandlers, Logger},
    App, HttpServer, Result,
};
use std::{env, fs, io};

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::init();

    fs::remove_dir_all("storage/cache").ok();

    let mut port = 8080;

    if let Ok(p) = env::var("PORT") {
        if let Ok(p) = p.parse::<u16>() {
            port = p
        }
    };

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::new("%s %r"))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, not_found))
            .wrap(ErrorHandlers::new().handler(StatusCode::INTERNAL_SERVER_ERROR, internal_error))
            .wrap(Compress::default())
            .configure(routes::configure)
    })
    .bind(format!("0.0.0.0:{port}"))?
    .run()
    .await
}

fn not_found<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let title = "Page Not Found".to_string();
    let site = models::Site::get();

    error_response(
        res,
        common::render_template(views::NotFound { site, title }),
    )
}

fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let title = "Internal Error".to_string();
    let site = models::Site::get();

    error_response(
        res,
        common::render_template(views::InternalError { site, title }),
    )
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
