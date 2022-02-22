use actix_files::NamedFile;
use actix_web::{error, error::ErrorNotFound, http::StatusCode, web, Result};
use derive_more::{Display, Error};
use handlebars::Handlebars;
use std::{convert::AsRef, fs, path::Path};

pub fn dynamic_response<F: Fn() -> std::result::Result<String, CustomError>, P: AsRef<Path>>(
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

pub fn render_content<P: AsRef<Path>>(
  hb: web::Data<Handlebars>,
  src: P,
  data: &serde_json::Value,
) -> Result<String, CustomError> {
  use minify_html_onepass::{in_place_str, Cfg};

  let src = src.as_ref();

  let cfg = &Cfg {
    minify_js: false,
    minify_css: false,
  };

  let template = src.to_str().expect("Template src");

  match hb.render(template, &data) {
    Ok(html) => {
      let mut html_clone = html.clone();

      let html = in_place_str(&mut html_clone, cfg).unwrap_or_else(|_| &html);

      Ok(html.to_string())
    }
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
