mod handlers;

use actix_web::http::StatusCode;
use actix_web::middleware::errhandlers::ErrorHandlers;
use actix_web::middleware::{Compress, Logger};
use actix_web::{web, App, HttpServer};
use dotenv::dotenv;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use std::{env, fs, io};

#[actix_web::main]
async fn main() -> io::Result<()> {
    dotenv().expect("Failed to read .env file");

    env_logger::init();

    fs::remove_dir_all("storage/cache").ok();

    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls())?;

    builder.set_private_key_file(
        env::var("SSL_KEY").expect("Failed to read env variable SSL_KEY"),
        SslFiletype::PEM,
    )?;

    builder.set_certificate_chain_file(
        env::var("SSL_CERT").expect("Failed to read env variable SSL_CERT"),
    )?;

    HttpServer::new(move || {
        App::new()
            .wrap(Compress::default())
            .wrap(Logger::new("%s %r"))
            .route("/", web::get().to(handlers::index_page))
            .route("/{file:[/@a-zA-Z0-9_-]*}", web::get().to(handlers::page))
            .route(
                "/styles/{file:[/@a-zA-Z0-9_-]*?\\.css}",
                web::get().to(handlers::stylesheet),
            )
            .route(
                "/modules/{file:[/@a-zA-Z0-9_-]*?\\.js}",
                web::get().to(handlers::modules_js),
            )
            .route(
                "/static/{file:[/@a-zA-Z0-9_-]*?\\.js}",
                web::get().to(handlers::static_js),
            )
            .route(
                "/static/{file:[/@a-zA-Z0-9_-]*?\\.[a-z0-9]+}",
                web::get().to(handlers::file),
            )
            .route("/robots.txt", web::get().to(handlers::robots))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, handlers::not_found_page))
            .wrap(
                ErrorHandlers::new()
                    .handler(StatusCode::INTERNAL_SERVER_ERROR, handlers::internal_error),
            )
    })
    .bind_openssl(
        env::var("BIND_ADDRESS").expect("Failed to read env variable BIND_ADDRESS"),
        builder,
    )?
    .run()
    .await
}
