use crate::common::{cacheable_response, static_response, CustomError};
use actix_files::NamedFile;
use actix_web::{web, Result};
use std::{convert::AsRef, fs, path::Path, sync::Arc};

pub async fn file(file: web::Path<String>) -> Result<NamedFile> {
  let src = Path::new("assets").join(file.to_string());

  let mut ext_str = "";

  if let Some(ext) = src.extension().and_then(|ext| ext.to_str()) {
    ext_str = ext;
  }

  match ext_str {
    "js" => js_response(src),
    "css" => css_response(src),
    _ => static_response(src),
  }
}

fn js_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
  use swc::{
    common::{
      errors::{ColorConfig, Handler},
      SourceMap,
    },
    config::Options,
  };

  cacheable_response(&src, || {
    let cm = Arc::<SourceMap>::default();
    let handler = Arc::new(Handler::with_tty_emitter(
      ColorConfig::Auto,
      true,
      false,
      Some(cm.clone()),
    ));
    let c = swc::Compiler::new(cm.clone());
    let fm = cm
      .load_file(src.as_ref())
      .map_err(|err| CustomError::Internal {
        message: format!("{err:?}"),
      })?;
    let json = r#"{
        "minify": true,
        "env": {
          "targets": "defaults and supports es6-module and not dead"
        },
        "jsc": {
          "minify": {
            "compress": true,
            "mangle": true
          }
        },
        "module": {
          "type": "es6"
        }
      }"#;
    let options: Options = serde_json::from_str(json).map_err(|err| CustomError::Internal {
      message: format!("{err:?}"),
    })?;

    c.process_js_file(fm, &handler, &options)
      .and_then(|transformed| Ok(transformed.code))
      .map_err(|err| CustomError::Internal {
        message: format!("{err:?}"),
      })
  })
}

fn css_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
  use parcel_css::{stylesheet, targets};

  cacheable_response(&src, || -> Result<String, CustomError> {
    let file_contents = fs::read_to_string(&src).map_err(|err| CustomError::Internal {
      message: format!("{err:?}"),
    })?;
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
    parser_options.custom_media = true;

    let mut minifier_options = stylesheet::MinifyOptions::default();

    minifier_options.targets = targets;

    let mut printer_options = stylesheet::PrinterOptions::default();

    printer_options.minify = true;
    printer_options.targets = targets;

    match stylesheet::StyleSheet::parse(
      src.as_ref().to_str().unwrap_or_default().to_string(),
      &file_contents.clone(),
      parser_options,
    ) {
      Ok(mut stylesheet) => match stylesheet.minify(minifier_options) {
        Ok(_) => match stylesheet.to_css(printer_options) {
          Ok(css) => Ok(css.code),
          Err(err) => Err(CustomError::Internal {
            message: format!("{err:?}"),
          }),
        },
        Err(err) => Err(CustomError::Internal {
          message: format!("{err:?}"),
        }),
      },
      Err(err) => Err(CustomError::Internal {
        message: format!("{err:?}"),
      }),
    }
  })
}
