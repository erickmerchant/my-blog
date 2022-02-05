mod assets;
mod common;
mod pages;

use actix_web::{
    http::StatusCode,
    middleware::{Compress, ErrorHandlers, Logger},
    web, App, HttpServer,
};
use dotenv::dotenv;
use handlebars::Handlebars;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use std::{env, fs, io};

#[actix_web::main]
async fn main() -> io::Result<()> {
    dotenv().expect("Failed to read .env file");

    env_logger::init();

    fs::remove_dir_all("storage/cache").ok();

    let mut ssl_builder = SslAcceptor::mozilla_intermediate(SslMethod::tls())?;

    ssl_builder.set_private_key_file(
        env::var("SSL_KEY").expect("Failed to read env variable SSL_KEY"),
        SslFiletype::PEM,
    )?;
    ssl_builder.set_certificate_chain_file(
        env::var("SSL_CERT").expect("Failed to read env variable SSL_CERT"),
    )?;

    HttpServer::new(move || {
        let mut handlebars = Handlebars::new();
        handlebars
            .register_templates_directory(".hbs", "./templates")
            .expect("Templates");
        let handlebars_ref = web::Data::new(handlebars);

        App::new()
            .wrap(Logger::new("%s %r"))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, pages::not_found))
            .wrap(
                ErrorHandlers::new()
                    .handler(StatusCode::INTERNAL_SERVER_ERROR, pages::internal_error),
            )
            .wrap(Compress::default())
            .app_data(handlebars_ref.clone())
            .route("/", web::get().to(pages::index))
            .route("/{file:.*.html}", web::get().to(pages::page))
            .route("/{file:.*?}", web::get().to(assets::file))
    })
    .bind_openssl(
        env::var("BIND_ADDRESS").expect("Failed to read env variable BIND_ADDRESS"),
        ssl_builder,
    )?
    .run()
    .await
}
