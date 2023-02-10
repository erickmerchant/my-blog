use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use serde_json::{from_value, json};
use std::{convert::AsRef, env::var, fs, path::Path, sync::Arc};
use swc::{config::Options, config::SourceMapsConfig};
use swc_common::{errors::ColorConfig, errors::Handler, SourceMap, GLOBALS};

pub async fn js(file: web::Path<String>) -> Result<NamedFile> {
    let src = Path::new("theme")
        .join(file.to_string())
        .with_extension("js");

    let file = if let Some(file) = super::Cache::get(&src) {
        file?
    } else {
        let targets = fs::read_to_string("./.browserslistrc")
            .unwrap_or("supports es6-module and last 2 versions".to_string());
        let src = src.as_ref();
        let cm = Arc::<SourceMap>::default();
        let handler = Arc::new(Handler::with_tty_emitter(
            ColorConfig::Auto,
            true,
            false,
            Some(cm.clone()),
        ));
        let c = swc::Compiler::new(cm.clone());
        let fm = cm.load_file(src).map_err(ErrorNotFound)?;
        let options = json!({
            "minify": true,
            "env": {
                "targets": targets,
                "bugfixes": true
            },
            "jsc": {
                "parser": {
                    "syntax": "ecmascript",
                },
                "minify": {
                    "compress": true,
                    "mangle": true
                }
            },
            "module": {
                "type": "es6"
            }
        });
        let mut options = from_value::<Options>(options).map_err(ErrorInternalServerError)?;

        if let Ok(source_maps) = var("SOURCE_MAPS") {
            if source_maps == "true" {
                options.source_maps = Some(SourceMapsConfig::Str("inline".to_string()));
            }
        }

        let code = GLOBALS.set(&Default::default(), || {
            c.process_js_file(fm, &handler, &options)
                .map(|transformed| transformed.code)
                .map_err(ErrorInternalServerError)
        })?;

        super::Cache::set(src, code)?
    };

    super::file(file, src)
}
