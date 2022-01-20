use crate::common::{dynamic_response, static_response};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use std::{convert::AsRef, fs, path::Path, sync::Arc};

pub async fn vendor_file(file: web::Path<String>) -> Result<NamedFile> {
  get_file_response(Path::new("vendor").join(file.to_owned()))
}

pub async fn file(file: web::Path<String>) -> Result<NamedFile> {
  get_file_response(Path::new("static").join(file.to_owned()))
}

pub async fn robots() -> Result<NamedFile> {
  static_response(Path::new("static/robots.txt"))
}

fn get_file_response<P: AsRef<Path>>(cache: P) -> Result<NamedFile> {
  let mut ext_str = "";

  if let Some(ext) = cache.as_ref().extension().and_then(|ext| ext.to_str()) {
    ext_str = ext
  }

  if ext_str == "js" || ext_str == "mjs" {
    js_response(cache)
  } else if ext_str == "css" {
    css_response(cache)
  } else {
    static_response(cache)
  }
}

fn js_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
  use swc::config::Options;
  use swc_common::{
    errors::{ColorConfig, Handler},
    SourceMap,
  };

  dynamic_response(
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

fn css_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
  use parcel_css::{stylesheet, targets};

  dynamic_response(
    src.as_ref(),
    Path::new("storage/cache").join(src.as_ref()).as_ref(),
    |file_contents: String| -> Result<String> {
      let targets = Some(targets::Browsers {
        android: Some(96 << 16),
        chrome: Some(94 << 16),
        edge: Some(95 << 16),
        firefox: Some(78 << 16),
        ios_saf: Some((12 << 16) | (2 << 8)),
        opera: Some(80 << 16),
        safari: Some((13 << 16) | (1 << 8)),
        samsung: Some(14 << 16),
        ie: None,
      });

      let mut parser_options = stylesheet::ParserOptions::default();
      parser_options.nesting = true;

      let mut printer_options = stylesheet::PrinterOptions::default();
      printer_options.minify = true;
      printer_options.targets = targets;

      match stylesheet::StyleSheet::parse(
        String::from(src.as_ref().to_str().unwrap_or_default()),
        &file_contents,
        parser_options,
      ) {
        Ok(stylesheet) => match stylesheet.to_css(printer_options) {
          Ok(css) => Ok(css.code),
          Err(err) => Err(ErrorInternalServerError(err.reason())),
        },
        Err(err) => Err(ErrorInternalServerError(format!("{:?}", err))),
      }
    },
  )
}
