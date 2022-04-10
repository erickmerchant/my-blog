use actix_files::NamedFile;
use actix_web::{error, error::ErrorNotFound, http::StatusCode, Result};
use derive_more::{Display, Error};
use maud::Render;
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

pub fn static_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
  NamedFile::open(src)
    .and_then(|file| {
      let file = file
        .prefer_utf8(true)
        .use_etag(true)
        .use_last_modified(true)
        .disable_content_disposition();

      Ok(file)
    })
    .or_else(|err| Err(ErrorNotFound(err)))
}

pub fn html_response(html: impl Render) -> Result<String, CustomError> {
  use minify_html_onepass::{in_place_str, Cfg};

  let cfg = &Cfg {
    minify_js: false,
    minify_css: false,
  };

  let mut html_clone = html.render().into_string();
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
