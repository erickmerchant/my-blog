use crate::common::dynamic_response;
use actix_files::NamedFile;
use actix_web::{
  dev::ServiceResponse,
  error::ErrorInternalServerError,
  http::header::{HeaderName, HeaderValue},
  middleware::ErrorHandlerResponse,
  web, Result,
};
use lazy_static::lazy_static;
use std::path::Path;

lazy_static! {
  static ref TEMPLATES: tera::Tera = {
    let mut tera = tera::Tera::new("templates/**/*").expect("Tera parsing error");
    tera.autoescape_on(vec![".html"]);
    tera
  };
}

lazy_static! {
  static ref DEFAULT_FRONTMATTER: toml::Value = r#"
    title = ""
  "#
  .parse::<toml::Value>()
  .expect("Failed to deserialize default front matter");
}

lazy_static! {
  static ref NOT_FOUND_BODY: String = TEMPLATES
    .render("not_found.html", &tera::Context::new())
    .expect("Failed to render not_found.html");
}

lazy_static! {
  static ref INTERNAL_ERROR_BODY: String = TEMPLATES
    .render("internal_error.html", &tera::Context::new())
    .expect("Failed to render internal_error.html");
}

pub async fn index() -> Result<NamedFile> {
  page(web::Path::from(String::from("index.html"))).await
}

pub async fn page(mut file: web::Path<String>) -> Result<NamedFile> {
  if file.ends_with("/") {
    file.push_str("index.html");
  }

  dynamic_response(
    Path::new("content").join(file.to_string()),
    Path::new("storage/cache/html").join(file.to_string()),
    |file_contents: String| {
      use minify_html_onepass::{in_place_str, Cfg};

      let cfg = &Cfg {
        minify_js: false,
        minify_css: false,
      };

      let context = get_context(file_contents);
      let mut template = "page.html";

      if let Some(t) = context
        .get("data")
        .and_then(|d| d.get("template"))
        .and_then(|t| t.as_str())
      {
        template = t;
      }

      match TEMPLATES.render(template, &context) {
        Ok(html) => {
          let mut html_clone = html.clone();

          let html = in_place_str(&mut html_clone, cfg).unwrap_or_else(|_| &html);

          Ok(html.to_string())
        }
        Err(err) => Err(ErrorInternalServerError(err)),
      }
    },
  )
}

pub fn not_found<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
  error_response(res, NOT_FOUND_BODY.to_owned())
}

pub fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
  error_response(res, INTERNAL_ERROR_BODY.to_owned())
}

pub fn error_response<B>(res: ServiceResponse<B>, body: String) -> Result<ErrorHandlerResponse<B>> {
  let (req, res) = res.into_parts();
  let res = res.set_body(body);
  let mut res = ServiceResponse::new(req, res)
    .map_into_boxed_body()
    .map_into_right_body();
  let headers = res.headers_mut();

  headers.insert(
    HeaderName::from_static("content-type"),
    HeaderValue::from_static("text/html; charset=utf-8"),
  );

  let res = ErrorHandlerResponse::Response(res);

  Ok(res)
}

fn get_context(file_contents: String) -> tera::Context {
  let mut context = tera::Context::new();
  let file_parts: Vec<&str> = file_contents.splitn(3, "+++").collect();
  let mut content = file_contents.as_str();

  if file_parts.len() == 3 {
    if let Ok(frontmatter) = file_parts[1].parse::<toml::Value>() {
      context.insert("data", &frontmatter);
    }

    content = file_parts[2];
  } else {
    context.insert("data", &DEFAULT_FRONTMATTER.clone());
  }

  context.insert("content", &content);
  context
}
