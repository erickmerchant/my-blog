use actix_files::NamedFile;
use actix_web::{
  dev::ServiceResponse,
  error::{ErrorInternalServerError, ErrorNotFound},
  middleware::errhandlers::ErrorHandlerResponse,
  web, HttpRequest, HttpResponse, Result,
};
use lazy_static::lazy_static;
use std::{convert::AsRef, fs, path::Path, sync::Arc};
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
    Path::new("content")
      .join(file.to_owned())
      .with_extension("md"),
    Path::new("storage/cache/html")
      .join(file.to_owned())
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
    Path::new("styles")
      .join(file.to_owned())
      .with_extension("scss"),
    Path::new("storage/cache/css").join(file.to_owned()),
    |file_contents: String| {
      grass::from_string(
        file_contents,
        &grass::Options::default().style(grass::OutputStyle::Compressed),
      )
    },
  )
}

pub async fn modules_js(req: HttpRequest, file: web::Path<String>) -> Result<NamedFile> {
  get_js_response(req, Path::new("modules").join(file.to_owned()))
}

pub async fn file(req: HttpRequest, file: web::Path<String>) -> Result<NamedFile> {
  let cache = Path::new("static").join(file.to_owned());

  if file.ends_with(".js") {
    get_js_response(req, cache)
  } else {
    get_static_response(req, cache)
  }
}

pub async fn robots(req: HttpRequest) -> Result<NamedFile> {
  get_static_response(req, Path::new("static/robots.txt"))
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

fn get_js_response<P: AsRef<Path>>(req: HttpRequest, src: P) -> Result<NamedFile> {
  get_dynamic_response(
    req,
    src.as_ref(),
    Path::new("storage/cache").join(src.as_ref()).as_ref(),
    |_file_contents: String| {
      let cm = Arc::<SourceMap>::default();
      let handler = Arc::new(Handler::with_tty_emitter(
        ColorConfig::Auto,
        true,
        false,
        Some(cm.clone()),
      ));
      let c = swc::Compiler::new(cm.clone());

      let fm = cm.load_file(src.as_ref())?;

      let swcrc = fs::read_to_string(".swcrc")?;

      let options: Options = serde_json::from_str(swcrc.as_str())?;

      c.process_js_file(fm, &handler, &options)
        .and_then(|transformed| Ok(transformed.code))
    },
  )
}

fn get_dynamic_response<
  F: Fn(String) -> std::result::Result<String, E>,
  E: std::fmt::Debug + std::fmt::Display + 'static,
  P: AsRef<Path>,
>(
  req: HttpRequest,
  src: P,
  cache: P,
  process: F,
) -> Result<NamedFile> {
  match fs::metadata(src.as_ref()) {
    Ok(src_metadata) => {
      let mut use_cache = false;

      if let Ok(cache_metadata) = fs::metadata(cache.as_ref()) {
        if let (Ok(cache_time), Ok(src_time)) = (cache_metadata.modified(), src_metadata.modified())
        {
          use_cache = cache_time > src_time;
        }
      }

      if !use_cache {
        let file_contents = fs::read_to_string(src)?;

        match process(file_contents) {
          Ok(body) => {
            fs::create_dir_all(cache.as_ref().with_file_name(""))?;

            fs::write(cache.as_ref(), body)?;

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

fn get_static_response<P: AsRef<Path>>(_req: HttpRequest, src: P) -> Result<NamedFile> {
  NamedFile::open(src)
    .and_then(|file| {
      Ok(
        file
          .prefer_utf8(true)
          .use_etag(true)
          .use_last_modified(true)
          .disable_content_disposition(),
      )
    })
    .or_else(|err| Err(ErrorNotFound(err)))
}

fn get_context(file_contents: String) -> tera::Context {
  let mut context = tera::Context::new();

  let file_parts: Vec<&str> = file_contents.splitn(3, "+++").collect();

  if file_parts.len() == 3 {
    if let Ok(frontmatter) = file_parts[1].parse::<toml::Value>() {
      context.insert("data", &frontmatter);
    }

    let markdown = file_parts[2];
    let mut content = String::new();
    let md_parser = pulldown_cmark::Parser::new_ext(markdown, pulldown_cmark::Options::empty());
    pulldown_cmark::html::push_html(&mut content, md_parser);

    context.insert("content", &content);
  } else {
    context.insert("content", &file_contents);
  }

  context
}
