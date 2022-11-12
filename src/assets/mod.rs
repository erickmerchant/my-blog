mod css;
mod js;

use crate::{config, named_file};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use css::css_asset;
use js::js_asset;
use std::{convert::AsRef, fs::File, path::Path};

pub async fn asset(
    file: web::Path<String>,
    config: web::Data<config::Config>,
) -> Result<NamedFile> {
    let src = Path::new("assets").join(file.to_string());
    let ext_str = src.extension().and_then(|ext| ext.to_str()).unwrap_or("");

    match ext_str {
        "js" => js_asset(src, config),
        "css" => css_asset(src, config),
        _ => default_asset(src),
    }
}

fn default_asset<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
    let file = File::open(&src).map_err(ErrorInternalServerError)?;

    named_file::response(file, src)
}
