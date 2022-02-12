mod assets;
mod common;
mod pages;

use actix_web::{
    http::StatusCode,
    middleware::{Compress, ErrorHandlers, Logger},
    web, App, HttpServer,
};

use handlebars::Handlebars;
use std::io;

pub fn configure_app(cfg: &mut web::ServiceConfig) {
    let mut handlebars = Handlebars::new();
    handlebars
        .register_templates_directory(".hbs", "./templates")
        .expect("Templates");
    let handlebars_ref = web::Data::new(handlebars);

    cfg.service(
        web::scope("")
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
            .route("/{file:.*?}", web::get().to(assets::file)),
    );
}

#[cfg(feature = "local-dev")]
#[actix_web::main]
async fn main() -> io::Result<()> {
    use dotenv::dotenv;
    use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
    use std::{env, fs};

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

    HttpServer::new(move || App::new().configure(configure_app))
        .bind_openssl(
            env::var("BIND_ADDRESS").expect("Failed to read env variable BIND_ADDRESS"),
            ssl_builder,
        )?
        .run()
        .await
}

#[cfg(not(feature = "local-dev"))]
#[actix_web::main]
async fn main() -> io::Result<()> {
    HttpServer::new(move || App::new().configure(configure_app))
        .bind("0.0.0.0:1000")?
        .run()
        .await
}
