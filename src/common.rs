use actix_files::NamedFile;
use actix_web::{error, http::StatusCode, Result};
use askama::Template;
use derive_more::{Display, Error};
use std::{convert::AsRef, fs, path::Path};

pub fn cacheable_response<F: Fn() -> Result<String, CustomError>, P: AsRef<Path>>(
  src: P,
  process: F,
) -> Result<NamedFile> {
  let cache = Path::new("storage/cache").join(src.as_ref());

  if let Err(_meta) = fs::metadata(&cache) {
    let body = process().map_err(CustomError::new_internal)?;

    fs::create_dir_all(&cache.with_file_name("")).map_err(CustomError::new_internal)?;
    fs::write(&cache, body).map_err(CustomError::new_internal)?;
  }

  static_response(cache)
}

pub fn static_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
  let file = NamedFile::open(src).map_err(|_| CustomError::NotFound)?;
  let file = file
    .prefer_utf8(true)
    .use_etag(true)
    .use_last_modified(true)
    .disable_content_disposition();

  Ok(file)
}

pub fn html_response(html: impl Template) -> Result<String, CustomError> {
  use minify_html_onepass::{in_place_str, Cfg};

  let cfg = &Cfg {
    minify_js: false,
    minify_css: false,
  };

  let mut html_clone = html.render().unwrap_or_default();
  let html_clone = html_clone.as_mut_str();

  let html = in_place_str(html_clone, cfg).map_err(CustomError::new_internal)?;

  Ok(html.to_string())
}

#[derive(Debug, Display, Error)]
pub enum CustomError {
  NotFound,
  Internal {},
}

impl CustomError {
  pub fn new_internal<E: std::fmt::Debug>(err: E) -> Self {
    log::error!("{err:?}");

    Self::Internal {}
  }
}

impl error::ResponseError for CustomError {
  fn status_code(&self) -> StatusCode {
    match self {
      Self::NotFound => StatusCode::NOT_FOUND,
      Self::Internal {} => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }
}
