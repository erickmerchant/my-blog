use crate::common::dynamic_response;
use actix_files::NamedFile;
use actix_web::{
  dev::ServiceResponse,
  error::ErrorInternalServerError,
  http::header::{HeaderName, HeaderValue},
  middleware::ErrorHandlerResponse,
  web, Result,
};
use handlebars::Handlebars;
use lazy_static::lazy_static;
use serde_json::value::Value;
use std::{convert::AsRef, fs, path::Path};

lazy_static! {
  static ref DATA: Value = {
    let contents = fs::read_to_string("data.json").expect("Failed to read data.json");

    let data: Value = serde_json::from_str(&contents).expect("Failed to parse data.json");

    data
  };
}

pub async fn index(hb: web::Data<Handlebars<'_>>) -> Result<NamedFile> {
  page(hb, web::Path::from(String::from("index.html"))).await
}

pub async fn page(hb: web::Data<Handlebars<'_>>, mut file: web::Path<String>) -> Result<NamedFile> {
  if file.ends_with("/") {
    file.push_str("index.html");
  }

  dynamic_response(
    Path::new("template/page").join(format!("{file}.hbs")),
    Path::new("storage/cache/html").join(file.to_string()),
    || render_content(hb.clone(), Path::new("page").join(file.to_string())),
  )
}

pub fn not_found<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
  error_response(res, "page/404.html")
}

pub fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
  error_response(res, "page/500.html")
}

fn error_response<B>(res: ServiceResponse<B>, src: &str) -> Result<ErrorHandlerResponse<B>> {
  let request = res.request();
  let body = match request.app_data::<web::Data<Handlebars>>() {
    Some(hb) => match render_content(hb.clone(), src.to_owned()) {
      Ok(html) => html,
      Err(_) => String::default(),
    },
    None => String::default(),
  };

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

fn render_content<P: AsRef<Path>>(hb: web::Data<Handlebars>, src: P) -> Result<String> {
  use minify_html_onepass::{in_place_str, Cfg};

  let src = src.as_ref();

  let cfg = &Cfg {
    minify_js: false,
    minify_css: false,
  };

  let template = src.to_str().expect("Template src");

  match hb.render(template, &DATA.to_owned()) {
    Ok(html) => {
      let mut html_clone = html.clone();

      let html = in_place_str(&mut html_clone, cfg).unwrap_or_else(|_| &html);

      Ok(html.to_string())
    }
    Err(err) => Err(ErrorInternalServerError(err)),
  }
}
