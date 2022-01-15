use crate::common::{dynamic_response, static_response};
use actix_files::NamedFile;
use actix_web::{web, Result};
use std::{convert::AsRef, fs, path::Path, sync::Arc};
use swc::config::Options;
use swc_common::{
  errors::{ColorConfig, Handler},
  SourceMap,
};

pub async fn stylesheet(file: web::Path<String>) -> Result<NamedFile> {
  dynamic_response(
    Path::new("styles")
      .join(file.to_owned())
      .with_extension("scss"),
    Path::new("storage/cache/css").join(file.to_owned()),
    |file_contents: String| {
      grass::from_string(
        file_contents,
        &grass::Options::default().style(grass::OutputStyle::Compressed),
      )
    },
  )
}

pub async fn modules_js(file: web::Path<String>) -> Result<NamedFile> {
  js_response(Path::new("modules").join(file.to_owned()))
}

pub async fn file(file: web::Path<String>) -> Result<NamedFile> {
  let cache = Path::new("static").join(file.to_owned());

  if file.ends_with(".js") {
    js_response(cache)
  } else {
    static_response(cache)
  }
}

pub async fn robots() -> Result<NamedFile> {
  static_response(Path::new("static/robots.txt"))
}

fn js_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
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
