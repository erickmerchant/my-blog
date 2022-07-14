mod models;
mod responses;
mod routes;
mod views;

use crate::{models::*, views::*};

use actix_web::{
    dev::ServiceResponse, http::header::HeaderName, http::header::HeaderValue, http::StatusCode,
    middleware::Compress, middleware::ErrorHandlerResponse, middleware::ErrorHandlers,
    middleware::Logger, web, App, HttpServer, Result,
};
use serde::Deserialize;
use std::{fs, io};

#[derive(Deserialize, Debug, Default, Clone, Copy)]
pub struct Config {
    #[serde(default)]
    pub source_maps: bool,
    #[serde(default = "default_port")]
    pub port: u16,
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
            .configure(routes::configure)
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
