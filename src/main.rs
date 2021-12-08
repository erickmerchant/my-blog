mod templates;

use actix_files::{Files, NamedFile};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::error::ErrorNotFound;
use actix_web::http::StatusCode;
use actix_web::middleware::errhandlers::{ErrorHandlerResponse, ErrorHandlers};
use actix_web::middleware::{Compress, Logger};
use actix_web::web::get;
use actix_web::{App, HttpRequest, HttpResponse, HttpServer, Result};
use dotenv::dotenv;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use std::path::Path;
use std::{env, fs, io};
use templates::{render_html, render_not_found_html};

#[actix_web::main]
async fn main() -> io::Result<()> {
    dotenv().expect("Failed to read .env file");

    env_logger::init();

    let default_file_handler = |req: ServiceRequest| {
        let (http_req, _payload) = req.into_parts();
        async {
            let response = HttpResponse::new(StatusCode::NOT_FOUND);

            Ok(ServiceResponse::new(http_req, response))
        }
    };

    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls())?;

    builder.set_private_key_file(
        env::var("SSL_KEY").expect("environment variable SSL_KEY"),
        SslFiletype::PEM,
    )?;

    builder
        .set_certificate_chain_file(env::var("SSL_CERT").expect("environment variable SSL_CERT"))?;

    HttpServer::new(move || {
        App::new()
            .wrap(Compress::default())
            .wrap(Logger::new("%s %r"))
            .route("/", get().to(handle_page))
            .route("/robots.txt", get().to(handle_robots))
            .route("/{slug:[a-z0-9-]+}", get().to(handle_page))
            .service(
                Files::new("/static", "static")
                    .use_etag(true)
                    .prefer_utf8(true)
                    .default_handler(default_file_handler),
            )
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, handle_not_found_page))
            .wrap(
                ErrorHandlers::new()
                    .handler(StatusCode::INTERNAL_SERVER_ERROR, handle_internal_error),
            )
    })
    .bind_openssl(
        env::var("BIND_ADDRESS").expect("environment variable BIND_ADDRESS"),
        builder,
    )?
    .run()
    .await
}

async fn handle_page(req: HttpRequest) -> Result<HttpResponse> {
    let slug: String = req
        .match_info()
        .get("slug")
        .unwrap_or("index")
        .parse()
        .unwrap_or_default();

    match fs::read_to_string(Path::new("content").join(slug).with_extension("md")) {
        Ok(file_contents) => {
            let page = render_html(file_contents);

            Ok(HttpResponse::Ok()
                .content_type("text/html; charset=utf-8")
                .body(page))
        }
        Err(err) => Err(ErrorNotFound(err)),
    }
}

async fn handle_robots() -> Result<NamedFile> {
    match NamedFile::open("static/robots.txt") {
        Ok(file) => Ok(file),
        Err(err) => Err(ErrorNotFound(err)),
    }
}

fn handle_not_found_page<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let page = render_not_found_html();

    Ok(ErrorHandlerResponse::Response(ServiceResponse::new(
        res.request().clone(),
        HttpResponse::NotFound()
            .content_type("text/html; charset=utf-8")
            .body(page)
            .into_body(),
    )))
}

fn handle_internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    Ok(ErrorHandlerResponse::Response(ServiceResponse::new(
        res.request().clone(),
        HttpResponse::InternalServerError()
            .body("An error occurred. Please try again later.")
            .into_body(),
    )))
}
