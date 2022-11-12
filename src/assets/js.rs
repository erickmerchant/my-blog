use crate::{cacheable, config};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use serde_json::{from_value, json};
use std::{convert::AsRef, path::Path, sync::Arc};

pub fn handler<P: AsRef<Path>>(src: P, config: web::Data<config::Config>) -> Result<NamedFile> {
    use swc::{config::Options, config::SourceMapsConfig};
    use swc_common::{errors::ColorConfig, errors::Handler, SourceMap, GLOBALS};
    cacheable::response(&src, || {
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
                "targets": config.targets,
                "bugfixes": true
            },
            "jsc": {
                "parser": {
                    "syntax": "ecmascript"
                },
                "minify": {
                    "compress": true,
                    "mangle": true
                },
            },
            "module": {
                "type": "es6"
            }
        });
        let mut options = from_value::<Options>(options).map_err(ErrorInternalServerError)?;

        if config.source_maps {
            options.source_maps = Some(SourceMapsConfig::Str("inline".to_string()));
        }

        GLOBALS.set(&Default::default(), || {
            c.process_js_file(fm, &handler, &options)
                .map(|transformed| transformed.code)
                .map_err(ErrorInternalServerError)
        })
    })
}
