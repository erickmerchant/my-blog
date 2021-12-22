use actix_files::NamedFile;
use actix_web::dev::ServiceResponse;
use actix_web::error::{ErrorInternalServerError, ErrorNotFound};
use actix_web::http::StatusCode;
use actix_web::middleware::errhandlers::{ErrorHandlerResponse, ErrorHandlers};
use actix_web::middleware::{Compress, Logger};
use actix_web::{web, App, HttpRequest, HttpResponse, HttpServer, Result};
use dotenv::dotenv;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use std::{env, fs, io, path};

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

    fs::remove_dir_all("storage/html").ok();

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
            .route(
                "/{content_path:[/@a-zA-Z0-9_-]*}",
                web::get().to(handle_page),
            )
            .route(
                "/styles/{stylesheet:[/@a-zA-Z0-9_-]*?\\.css}",
                web::get().to(handle_stylesheet),
            )
            .route(
                "/modules/{module:[/@a-zA-Z0-9_-]*?\\.js}",
                web::get().to(handle_module),
            )
            .route(
                "/static/{static_file:[/@a-zA-Z0-9_-]*?\\.[a-z0-9]+}",
                web::get().to(handle_static_file),
            )
            .route("/robots.txt", web::get().to(handle_robots))
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

async fn handle_index(req: HttpRequest) -> Result<NamedFile> {
    handle_page(req, web::Path(String::from("index"))).await
}

async fn handle_page(req: HttpRequest, page: web::Path<String>) -> Result<NamedFile> {
    get_dynamic_response(
        req,
        path::Path::new("content")
            .join(page.as_str())
            .with_extension("md"),
        path::Path::new("storage/html")
            .join(page.as_str())
            .with_extension("html"),
        |file_contents: String| {
            let context = get_context(file_contents);

            TEMPLATES.render("layout.html", &context)
        },
    )
}

async fn handle_stylesheet(req: HttpRequest, stylesheet: web::Path<String>) -> Result<NamedFile> {
    get_dynamic_response(
        req,
        path::Path::new("styles")
            .join(stylesheet.as_str())
            .with_extension("scss"),
        path::Path::new("storage/css").join(stylesheet.as_str()),
        |file_contents: String| {
            grass::from_string(
                file_contents,
                &grass::Options::default().style(grass::OutputStyle::Compressed),
            )
        },
    )
}

async fn handle_module(req: HttpRequest, module: web::Path<String>) -> Result<NamedFile> {
    get_static_response(
        req,
        path::Path::new("storage/modules").join(module.as_str()),
    )
}

async fn handle_static_file(req: HttpRequest, static_file: web::Path<String>) -> Result<NamedFile> {
    get_static_response(req, path::Path::new("static").join(static_file.as_str()))
}

async fn handle_robots(req: HttpRequest) -> Result<NamedFile> {
    get_static_response(req, path::Path::new("static/robots.txt").to_path_buf())
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
        Err(err) => {
            eprint!("{:?}", err);

            Err(ErrorInternalServerError(err))
        }
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

fn get_dynamic_response<
    F: Fn(String) -> std::result::Result<String, E>,
    E: std::fmt::Debug + std::fmt::Display + 'static,
>(
    req: HttpRequest,
    src: path::PathBuf,
    cache: path::PathBuf,
    process: F,
) -> Result<NamedFile> {
    match fs::metadata(&src) {
        Ok(src_metadata) => {
            let mut use_cache = false;

            if let Ok(cache_metadata) = fs::metadata(&cache) {
                if let (Ok(cache_time), Ok(src_time)) =
                    (cache_metadata.modified(), src_metadata.modified())
                {
                    use_cache = cache_time > src_time;
                }
            }

            if !use_cache {
                let file_contents = fs::read_to_string(&src)?;

                match process(file_contents) {
                    Ok(body) => {
                        if let Some(directory) = cache.parent() {
                            fs::create_dir_all(directory)?;
                        }

                        fs::write(&cache, &body)?;

                        Ok(())
                    }
                    Err(err) => {
                        eprint!("{:?}", err);

                        Err(ErrorInternalServerError(err))
                    }
                }?
            }

            get_static_response(req, cache)
        }
        Err(err) => Err(ErrorNotFound(err)),
    }
}

fn get_static_response(_req: HttpRequest, src: path::PathBuf) -> Result<NamedFile> {
    match fs::metadata(&src) {
        Ok(_) => match NamedFile::open(&src) {
            Ok(file) => Ok(file
                .prefer_utf8(true)
                .use_etag(true)
                .use_last_modified(true)
                .disable_content_disposition()),
            Err(err) => Err(ErrorNotFound(err)),
        },
        Err(err) => Err(ErrorNotFound(err)),
    }
}

fn render_markdown(markdown: String) -> String {
    let mut content = String::new();
    let md_parser = pulldown_cmark::Parser::new_ext(&markdown, pulldown_cmark::Options::empty());
    pulldown_cmark::html::push_html(&mut content, md_parser);
    content
}

fn get_context(file_contents: String) -> tera::Context {
    let mut context = tera::Context::new();

    let file_parts: Vec<&str> = file_contents.splitn(3, "+++").collect();

    if file_parts.len() == 3 {
        if let Ok(frontmatter) = file_parts[1].parse::<toml::Value>() {
            context.insert("data", &frontmatter);
        }

        context.insert("content", &render_markdown(file_parts[2].to_string()));
    } else {
        context.insert("content", &file_contents);
    }

    context
}
