mod models;
mod responses;
mod routes;
mod views;

use crate::{models::*, views::*};

use actix_web::{
    dev::ServiceResponse, error, http::header::HeaderName, http::header::HeaderValue,
    http::StatusCode, middleware::Compress, middleware::ErrorHandlerResponse,
    middleware::ErrorHandlers, middleware::Logger, web, App, HttpServer, Result,
};
use askama::Template;
use derive_more::{Display, Error};
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
    body: impl Template,
) -> Result<ErrorHandlerResponse<B>> {
    let body = body.render().unwrap_or_default();
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

#[derive(Debug, Display, Error)]
pub enum CustomError {
    NotFound,
    Internal {},
}

impl CustomError {
    pub fn new_internal<E: std::fmt::Debug>(err: E) -> Self {
        log::error!("{err:?}");

        Self::Internal {}
    }

    pub fn new_not_found<E: std::fmt::Debug>(err: E) -> Self {
        log::error!("{err:?}");

        Self::NotFound
    }
}

impl error::ResponseError for CustomError {
    fn status_code(&self) -> StatusCode {
        match self {
            Self::NotFound => StatusCode::NOT_FOUND,
            Self::Internal {} => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}
