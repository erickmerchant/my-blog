use actix_files::{Files, NamedFile};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::error::{ErrorInternalServerError, ErrorNotFound};
use actix_web::http::StatusCode;
use actix_web::middleware::errhandlers::{ErrorHandlerResponse, ErrorHandlers};
use actix_web::middleware::{Compress, Logger};
use actix_web::web::get;
use actix_web::{App, HttpRequest, HttpResponse, HttpServer, Result};
use dotenv::dotenv;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use std::path::Path;
use std::{env, fs, io};
use tera::{Context, Tera};
use toml::Value;

#[macro_use]
extern crate lazy_static;

lazy_static! {
    pub static ref TEMPLATES: Tera = {
        let mut tera = match Tera::new("templates/**/*") {
            Ok(t) => t,
            Err(e) => {
                println!("Parsing error(s): {}", e);
                ::std::process::exit(1);
            }
        };
        tera.autoescape_on(vec!["html"]);
        tera
    };
}

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
            .route(
                "/styles/{stylesheet:[a-z0-9-/]*?\\.css}",
                get().to(handle_styles),
            )
            .route("/{slug:[a-z0-9-]+}", get().to(handle_page))
            .service(
                Files::new("/static", "static")
                    .use_etag(true)
                    .prefer_utf8(true)
                    .default_handler(default_file_handler),
            )
            .service(
                Files::new("/modules", "modules")
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
            let file_parts: Vec<&str> = file_contents.splitn(3, "+++").collect();
            let mut context = Context::new();
            match file_parts[1].parse::<Value>() {
                Ok(frontmatter) => {
                    context.insert("data", &frontmatter);
                    context.insert("content", &render_markdown(file_parts[2].to_string()));

                    match TEMPLATES.render("layout.html", &context) {
                        Ok(page) => Ok(HttpResponse::Ok()
                            .content_type("text/html; charset=utf-8")
                            .body(page)),
                        Err(err) => Err(ErrorInternalServerError(err)),
                    }
                }
                Err(err) => Err(ErrorInternalServerError(err)),
            }
        }
        Err(err) => Err(ErrorNotFound(err)),
    }
}

async fn handle_styles(req: HttpRequest) -> Result<HttpResponse> {
    let stylesheet = req.match_info().get("stylesheet").unwrap_or("index");

    let options = grass::Options::default().style(grass::OutputStyle::Compressed);

    match grass::from_path(
        Path::new("styles")
            .join(Path::new(stylesheet).with_extension("scss"))
            .to_str()
            .unwrap(),
        &options,
    ) {
        Ok(css) => Ok(HttpResponse::Ok()
            .content_type("text/css; charset=utf-8")
            .body(css)),
        Err(err) => Err(ErrorInternalServerError(err)),
    }
}

async fn handle_robots() -> Result<NamedFile> {
    match NamedFile::open("static/robots.txt") {
        Ok(file) => Ok(file),
        Err(err) => Err(ErrorNotFound(err)),
    }
}

fn handle_not_found_page<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    match TEMPLATES.render("not_found.html", &Context::new()) {
        Ok(page) => Ok(ErrorHandlerResponse::Response(ServiceResponse::new(
            res.request().clone(),
            HttpResponse::NotFound()
                .content_type("text/html; charset=utf-8")
                .body(page)
                .into_body(),
        ))),
        Err(err) => Err(ErrorInternalServerError(err)),
    }
}

fn handle_internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    Ok(ErrorHandlerResponse::Response(ServiceResponse::new(
        res.request().clone(),
        HttpResponse::InternalServerError()
            .body("An error occurred. Please try again later.")
            .into_body(),
    )))
}

pub fn render_markdown(markdown: String) -> String {
    let mut content = String::new();
    let md_parser = pulldown_cmark::Parser::new_ext(&markdown, pulldown_cmark::Options::empty());
    pulldown_cmark::html::push_html(&mut content, md_parser);
    content
}
