mod service;

use actix_web::{App, HttpServer};
use std::{env, io};

#[cfg(feature = "local")]
#[actix_web::main]
async fn main() -> io::Result<()> {
    use dotenv::dotenv;
    use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
    use std::fs;

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

    let port = env::var("PORT").expect("Failed to read env variable PORT");

    HttpServer::new(move || App::new().configure(service::configure))
        .bind_openssl(format!("0.0.0.0:{port}"), ssl_builder)?
        .run()
        .await
}

#[cfg(not(feature = "local"))]
#[actix_web::main]
async fn main() -> io::Result<()> {
    let port = env::var("PORT").expect("Failed to read env variable PORT");

    HttpServer::new(move || App::new().configure(service::configure))
        .bind(format!("0.0.0.0:{port}"))?
        .run()
        .await
}
