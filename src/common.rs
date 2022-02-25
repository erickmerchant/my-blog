use actix_files::NamedFile;
use actix_web::{error, error::ErrorNotFound, http::StatusCode, HttpResponse, Result};
use derive_more::{Display, Error};
use maud::Markup;
use std::{convert::AsRef, fs, path::Path};

pub fn cacheable_response<F: Fn() -> std::result::Result<String, CustomError>, P: AsRef<Path>>(
  src: P,
  process: F,
) -> Result<NamedFile> {
  let cache = Path::new("storage/cache").join(src.as_ref());

  if let Err(_meta) = fs::metadata(&cache) {
    let body = process()?;

    fs::create_dir_all(&cache.with_file_name(""))?;
    fs::write(&cache, body)?;
  }

  static_response(cache)
}

pub fn dynamic_response<F: Fn() -> std::result::Result<String, CustomError>>(
  process: F,
) -> Result<HttpResponse> {
  let body = process()?;

  Ok(
    HttpResponse::Ok()
      .content_type("text/html; charset=utf-8")
      .body(body),
  )
}

pub fn static_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
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

pub fn minify_markup(html: Markup) -> Result<String, CustomError> {
  use minify_html_onepass::{in_place_str, Cfg};

  let cfg = &Cfg {
    minify_js: false,
    minify_css: false,
  };

  let mut html_clone = html.into_string();
  let html_clone = html_clone.as_mut_str();

  match in_place_str(html_clone, cfg) {
    Ok(html) => Ok(html.to_string()),
    Err(err) => Err(CustomError::Internal {
      message: format!("{err:?}"),
    }),
  }
}

#[derive(Debug, Display, Error)]
pub enum CustomError {
  NotFound {},
  Internal { message: String },
}

impl error::ResponseError for CustomError {
  fn status_code(&self) -> StatusCode {
    match self {
      CustomError::NotFound {} => StatusCode::NOT_FOUND,
      CustomError::Internal { message: _message } => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }
}
