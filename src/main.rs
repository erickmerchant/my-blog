mod assets;
mod cacheable;
mod config;
mod errors;
mod models;
mod named_file;
mod pages;

use actix_web::{
    http::StatusCode, middleware::Compress, middleware::DefaultHeaders, middleware::ErrorHandlers,
    middleware::Logger, web, App, HttpServer,
};
use std::{fs, io};
use tera::Tera;

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::init();
    fs::remove_dir_all("storage/cache").ok();

    let config = envy::from_env::<config::Config>().unwrap_or_default();
    let port = config.port;

    HttpServer::new(move || {
        let site = models::Site::get();
        let tera = Tera::new("templates/**/*").expect("templates parsing failed");

        App::new()
            .app_data(web::Data::new(config.to_owned()))
            .app_data(web::Data::new(site))
            .app_data(web::Data::new(tera))
            .wrap(Logger::new("%s %r"))
            .wrap(DefaultHeaders::new().add(("Content-Security-Policy", "default-src 'self'")))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, errors::not_found))
            .wrap(
                ErrorHandlers::new()
                    .handler(StatusCode::INTERNAL_SERVER_ERROR, errors::internal_error),
            )
            .wrap(Compress::default())
            .route("/", web::get().to(pages::home))
            .route("/posts.rss", web::get().to(pages::posts_rss))
            .route("/posts/{slug:.*?}.html", web::get().to(pages::post))
            .route("/{file:.*?}", web::get().to(assets::asset))
    })
    .bind(format!("0.0.0.0:{port}"))?
    .run()
    .await
}
