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
use std::path::Path;

pub async fn index(hb: web::Data<Handlebars<'_>>) -> Result<NamedFile> {
  page(hb, web::Path::from(String::from("index.html"))).await
}

pub async fn page(hb: web::Data<Handlebars<'_>>, mut file: web::Path<String>) -> Result<NamedFile> {
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
      let mut template = "page";

      if let Some(t) = context
        .get("data")
        .and_then(|d| d.get("template"))
        .and_then(|t| t.as_str())
      {
        template = t;
      }

      match hb.render(template, &context) {
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
  let request = res.request();
  let body = match request
    .app_data::<web::Data<Handlebars>>()
    .map(|t| t.get_ref())
  {
    Some(hb) => hb
      .render(
        "pages/error",
        &serde_json::json!({
          "data": {
            "title": "Page Not Found",
            "message": "That resource was moved, removed, or never existed."
          }
        }),
      )
      .unwrap_or_default(),
    None => String::from(""),
  };

  error_response(res, body)
}

pub fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
  let request = res.request();
  let body = match request
    .app_data::<web::Data<Handlebars>>()
    .map(|t| t.get_ref())
  {
    Some(hb) => hb
      .render(
        "pages/error",
        &serde_json::json!({"data":{"title": "Internal Error", "message": "An error occurred. Please try again later."}}),
      )
      .unwrap_or_default(),
    None => String::from(""),
  };

  error_response(res, body)
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

fn get_context(file_contents: String) -> serde_json::Value {
  let mut context = serde_json::json!({});
  let file_parts: Vec<&str> = file_contents.splitn(3, "---").collect();
  let mut content = file_contents.as_str();

  if file_parts.len() == 3 {
    if let Ok(frontmatter) = file_parts[1].parse::<serde_json::Value>() {
      context["data"] = frontmatter;
    }

    content = file_parts[2];
  } else {
    context["data"] = serde_json::json!({});
  }

  context["content"] = serde_json::Value::from(content);
  context
}
