use actix_files::NamedFile;
use actix_web::{
  error::{ErrorInternalServerError, ErrorNotFound},
  web, Result,
};
use handlebars::Handlebars;
use serde_json::json;
use std::{convert::AsRef, fs, path::Path};

pub fn dynamic_response<
  F: Fn() -> std::result::Result<String, E>,
  E: std::fmt::Debug + std::fmt::Display + 'static,
  P: AsRef<Path>,
>(
  src: P,
  process: F,
) -> Result<NamedFile> {
  let cache = Path::new("storage/cache").join(src.as_ref());

  if let Err(_meta) = fs::metadata(&cache) {
    let body = process().or_else(|err| Err(ErrorInternalServerError(err)))?;

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

pub fn template_response<P: AsRef<Path>>(hb: web::Data<Handlebars>, src: P) -> Result<NamedFile> {
  dynamic_response(src.as_ref(), || {
    render_content(hb.clone(), Path::new("page").join(src.as_ref()))
  })
}

pub fn render_content<P: AsRef<Path>>(hb: web::Data<Handlebars>, src: P) -> Result<String> {
  use minify_html_onepass::{in_place_str, Cfg};

  let src = src.as_ref();

  let cfg = &Cfg {
    minify_js: false,
    minify_css: false,
  };

  let template = src.to_str().expect("Template src");

  match hb.render(template, &json!({})) {
    Ok(html) => {
      let mut html_clone = html.clone();

      let html = in_place_str(&mut html_clone, cfg).unwrap_or_else(|_| &html);

      Ok(html.to_string())
    }
    Err(err) => Err(ErrorInternalServerError(err)),
  }
}
