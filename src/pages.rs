use crate::common::{render_content, template_response};
use actix_files::NamedFile;
use actix_web::{
  dev::ServiceResponse,
  http::header::{HeaderName, HeaderValue},
  middleware::ErrorHandlerResponse,
  web, Result,
};
use handlebars::Handlebars;

pub async fn index(hb: web::Data<Handlebars<'_>>) -> Result<NamedFile> {
  page(hb, web::Path::from(String::from("index.html"))).await
}

pub async fn page(hb: web::Data<Handlebars<'_>>, mut file: web::Path<String>) -> Result<NamedFile> {
  if file.ends_with("/") {
    file.push_str("index.html");
  }

  template_response(hb.clone(), file.to_string())
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
