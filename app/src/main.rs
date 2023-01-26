mod config;
mod error_routes;
mod models;
mod responses;
mod routes;
mod templates;

use crate::models::*;
use actix_web::{
    http::StatusCode, middleware::Compress, middleware::DefaultHeaders, middleware::ErrorHandlers,
    middleware::Logger, web, App, HttpServer,
};
use clap::Parser;
use std::{fs, io, io::Write};

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::builder()
        .format(|buf, record| writeln!(buf, "[{}] {}", record.level(), record.args()))
        .init();
    fs::remove_dir_all("storage/cache").ok();

    let server_config = config::ServerConfig::parse();
    let port = server_config.port;

    let template_env = templates::get_env();

    HttpServer::new(move || {
        let site = Site::get();
        let assets_config = config::AssetsConfig::get();

        App::new()
            .app_data(web::Data::new(server_config.clone()))
            .app_data(web::Data::new(assets_config))
            .app_data(web::Data::new(site))
            .app_data(web::Data::new(template_env.to_owned()))
            .wrap(Logger::new("%s %r"))
            .wrap(DefaultHeaders::new().add(("Content-Security-Policy", "default-src 'self'")))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, error_routes::not_found))
            .wrap(ErrorHandlers::new().handler(
                StatusCode::INTERNAL_SERVER_ERROR,
                error_routes::internal_error,
            ))
            .wrap(Compress::default())
            .route("/", web::get().to(routes::posts_index))
            .route("/posts.rss", web::get().to(routes::posts_rss))
            .route("/{file:.*?}.html", web::get().to(routes::page))
            .route("/{file:.*?}.{ext:jsx?}", web::get().to(routes::js))
            .route("/{file:.*?}.css", web::get().to(routes::css))
            .route("/{file:.*?}", web::get().to(routes::asset))
    })
    .bind(format!("0.0.0.0:{port}"))?
    .run()
    .await
}
