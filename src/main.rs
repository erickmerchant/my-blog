use actix_files::{Files, NamedFile};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::error::{ErrorInternalServerError, ErrorNotFound};
use actix_web::http::StatusCode;
use actix_web::middleware::errhandlers::{ErrorHandlerResponse, ErrorHandlers};
use actix_web::middleware::{Compress, Logger};
use actix_web::{web, App, HttpRequest, HttpResponse, HttpServer, Result};
use dotenv::dotenv;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use std::{env, fs, io, path, time};

#[macro_use]
extern crate lazy_static;

lazy_static! {
    pub static ref TEMPLATES: tera::Tera = {
        let mut tera = tera::Tera::new("templates/**/*").expect("Tera parsing error");
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
            .route("/", web::get().to(handle_index))
            .route("/robots.txt", web::get().to(handle_robots))
            .route(
                "/styles/{stylesheet:[/a-z0-9-]*?\\.css}",
                web::get().to(handle_styles),
            )
            .route("/{content_path:[/a-z0-9-]*}", web::get().to(handle_page))
            .service(
                Files::new("/static", "static")
                    .use_etag(true)
                    .prefer_utf8(true)
                    .default_handler(default_file_handler),
            )
            .service(
                Files::new("/modules", "storage/modules")
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
        env::var("BIND_ADDRESS").expect("Failed to read env variable BIND_ADDRESS"),
        builder,
    )?
    .run()
    .await
}

async fn handle_index() -> Result<HttpResponse> {
    handle_page(web::Path(String::from("index"))).await
}

async fn handle_page(content_path: web::Path<String>) -> Result<HttpResponse> {
    let content_path = content_path.as_str();
    let markdown_path = path::Path::new("content")
        .join(content_path)
        .with_extension("md");

    match fs::metadata(&markdown_path) {
        Ok(_) => {
            let context = get_context(markdown_path);
            match TEMPLATES.render("layout.html", &context) {
                Ok(page) => Ok(HttpResponse::Ok()
                    .content_type("text/html; charset=utf-8")
                    .body(page)),
                Err(err) => Err(ErrorInternalServerError(err)),
            }
        }
        Err(err) => Err(ErrorNotFound(err)),
    }
}

async fn handle_styles(req: HttpRequest, stylesheet: web::Path<String>) -> Result<HttpResponse> {
    let scss_path = path::Path::new("styles")
        .join(stylesheet.as_str())
        .with_extension("scss");
    let cache_path = path::Path::new("storage/css").join(stylesheet.as_str());

    if use_cache(&cache_path, &scss_path) {
        let css = fs::read_to_string(&cache_path).unwrap_or_default();

        let etag = get_etag(&cache_path, &css);

        let mut send_body = true;

        if let Some(header) = req.headers().get("if-none-match") {
            if header.to_str().unwrap_or_default() == etag {
                send_body = false;
            }
        }

        if send_body {
            Ok(HttpResponse::Ok()
                .content_type("text/css; charset=utf-8")
                .header("etag", etag)
                .body(css))
        } else {
            Ok(HttpResponse::new(StatusCode::NOT_MODIFIED))
        }
    } else {
        let options = grass::Options::default().style(grass::OutputStyle::Compressed);

        match grass::from_path(scss_path.to_str().unwrap_or_default(), &options) {
            Ok(css) => {
                fs::create_dir_all(cache_path.parent().unwrap()).unwrap_or_default();
                fs::write(&cache_path, &css).unwrap_or_default();

                let mut response = HttpResponse::Ok();
                response.content_type("text/css; charset=utf-8");

                let etag = get_etag(&cache_path, &css);

                if etag != String::default() {
                    response.header("etag", etag);
                }

                Ok(response.body(&css))
            }
            Err(err) => Err(ErrorInternalServerError(err)),
        }
    }
}

async fn handle_robots() -> Result<NamedFile> {
    match NamedFile::open("static/robots.txt") {
        Ok(file) => Ok(file),
        Err(err) => Err(ErrorNotFound(err)),
    }
}

fn handle_not_found_page<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    match TEMPLATES.render("not_found.html", &tera::Context::new()) {
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

fn render_markdown(markdown: String) -> String {
    let mut content = String::new();
    let md_parser = pulldown_cmark::Parser::new_ext(&markdown, pulldown_cmark::Options::empty());
    pulldown_cmark::html::push_html(&mut content, md_parser);
    content
}

fn get_context(path: path::PathBuf) -> tera::Context {
    let mut context = tera::Context::new();

    if let Ok(file_contents) = fs::read_to_string(path) {
        let file_parts: Vec<&str> = file_contents.splitn(3, "+++").collect();

        if let Ok(frontmatter) = file_parts[1].parse::<toml::Value>() {
            context.insert("data", &frontmatter);
            context.insert("content", &render_markdown(file_parts[2].to_string()));
        }
    }

    context
}

fn use_cache(cache_path: &path::PathBuf, src_path: &path::PathBuf) -> bool {
    let mut result = false;

    if let (Ok(cache_metadata), Ok(src_metadata)) =
        (fs::metadata(cache_path), fs::metadata(src_path))
    {
        if let (Ok(cache_time), Ok(src_time)) = (cache_metadata.modified(), src_metadata.modified())
        {
            result = cache_time > src_time;
        }
    }

    result
}

fn get_etag(path: &path::PathBuf, contents: &String) -> String {
    let mut etag = String::default();

    if let Ok(metadata) = fs::metadata(path) {
        if let Ok(modified) = metadata.modified() {
            if let Ok(modified) = modified.duration_since(time::SystemTime::UNIX_EPOCH) {
                etag = format!("W/\"{}-{}\"", contents.len(), modified.as_secs());
            }
        }
    }

    etag
}
