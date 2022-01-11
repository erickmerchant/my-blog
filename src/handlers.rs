use actix_files::NamedFile;
use actix_web::dev::ServiceResponse;
use actix_web::error::{ErrorInternalServerError, ErrorNotFound};
use actix_web::middleware::errhandlers::ErrorHandlerResponse;
use actix_web::{web, HttpRequest, HttpResponse, Result};
use lazy_static::lazy_static;
use std::sync::Arc;
use std::{fs, path};
use swc::config::Options;
use swc_common::{
  errors::{ColorConfig, Handler},
  SourceMap,
};

lazy_static! {
  static ref TEMPLATES: tera::Tera = {
    let mut tera = tera::Tera::new("templates/**/*").expect("Tera parsing error");
    tera.autoescape_on(vec!["html"]);
    tera
  };
}

pub async fn index_page(req: HttpRequest) -> Result<NamedFile> {
  page(req, web::Path(String::from("index"))).await
}

pub async fn page(req: HttpRequest, file: web::Path<String>) -> Result<NamedFile> {
  get_dynamic_response(
    req,
    path::Path::new("content")
      .join(file.as_str())
      .with_extension("md"),
    path::Path::new("storage/cache/html")
      .join(file.as_str())
      .with_extension("html"),
    |file_contents: String| {
      let context = get_context(file_contents);

      TEMPLATES.render("layout.html", &context)
    },
  )
}

pub async fn stylesheet(req: HttpRequest, file: web::Path<String>) -> Result<NamedFile> {
  get_dynamic_response(
    req,
    path::Path::new("styles")
      .join(file.as_str())
      .with_extension("scss"),
    path::Path::new("storage/cache/css").join(file.as_str()),
    |file_contents: String| {
      grass::from_string(
        file_contents,
        &grass::Options::default().style(grass::OutputStyle::Compressed),
      )
    },
  )
}

pub async fn modules_js(req: HttpRequest, file: web::Path<String>) -> Result<NamedFile> {
  get_js_response(req, path::Path::new("modules").join(file.as_str()))
}

pub async fn static_js(req: HttpRequest, file: web::Path<String>) -> Result<NamedFile> {
  get_js_response(req, path::Path::new("static").join(file.as_str()))
}

pub async fn file(req: HttpRequest, file: web::Path<String>) -> Result<NamedFile> {
  get_static_response(req, path::Path::new("static").join(file.as_str()))
}

pub async fn robots(req: HttpRequest) -> Result<NamedFile> {
  get_static_response(req, path::Path::new("static/robots.txt").to_path_buf())
}

pub fn not_found_page<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
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

pub fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
  Ok(ErrorHandlerResponse::Response(ServiceResponse::new(
    res.request().clone(),
    HttpResponse::InternalServerError()
      .body("An error occurred. Please try again later.")
      .into_body(),
  )))
}

fn get_js_response(req: HttpRequest, src: path::PathBuf) -> Result<NamedFile> {
  get_dynamic_response(
    req,
    src.to_owned(),
    path::Path::new("storage/cache").join(&src),
    |_file_contents: String| {
      let cm = Arc::<SourceMap>::default();
      let handler = Arc::new(Handler::with_tty_emitter(
        ColorConfig::Auto,
        true,
        false,
        Some(cm.clone()),
      ));
      let c = swc::Compiler::new(cm.clone());

      let fm = cm.load_file(&src)?;

      let options_str = fs::read_to_string(".swcrc")?;

      let options: Options = serde_json::from_str(options_str.as_str())?;

      match c.process_js_file(fm, &handler, &options) {
        Ok(transformed) => Ok(transformed.code.to_string()),
        Err(err) => Err(err),
      }
    },
  )
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
        if let (Ok(cache_time), Ok(src_time)) = (cache_metadata.modified(), src_metadata.modified())
        {
          use_cache = cache_time > src_time;
        }
      }

      if !use_cache {
        let file_contents = fs::read_to_string(&src)?;

        match process(file_contents) {
          Ok(body) => {
            fs::create_dir_all(cache.with_file_name(""))?;

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
      Ok(file) => Ok(
        file
          .prefer_utf8(true)
          .use_etag(true)
          .use_last_modified(true)
          .disable_content_disposition(),
      ),
      Err(err) => Err(ErrorNotFound(err)),
    },
    Err(err) => Err(ErrorNotFound(err)),
  }
}

fn get_context(file_contents: String) -> tera::Context {
  let mut context = tera::Context::new();

  let file_parts: Vec<&str> = file_contents.splitn(3, "+++").collect();

  if file_parts.len() == 3 {
    if let Ok(frontmatter) = file_parts[1].parse::<toml::Value>() {
      context.insert("data", &frontmatter);
    }

    let markdown = file_parts[2].to_string();
    let mut content = String::new();
    let md_parser = pulldown_cmark::Parser::new_ext(&markdown, pulldown_cmark::Options::empty());
    pulldown_cmark::html::push_html(&mut content, md_parser);

    context.insert("content", &content);
  } else {
    context.insert("content", &file_contents);
  }

  context
}
