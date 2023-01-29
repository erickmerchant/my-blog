use crate::{config, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use actix_web_lab::extract;
use serde_json::{from_value, json};
use std::{convert::AsRef, path::Path, sync::Arc};
use swc::{config::Options, config::SourceMapsConfig};
use swc_common::{errors::ColorConfig, errors::Handler, SourceMap, GLOBALS};

pub async fn js(
    extract::Path((file, ext)): extract::Path<(String, String)>,
    assets_config: web::Data<config::AssetsConfig>,
    server_config: web::Data<config::ServerConfig>,
) -> Result<NamedFile> {
    let jsx = ext == *"jsx";
    let src = Path::new("assets").join(file).with_extension(ext);

    let file = if let Some(file) = responses::Cache::get(&src) {
        file?
    } else {
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
                "targets": assets_config.targets,
                "bugfixes": true
            },
            "jsc": {
                "parser": {
                    "syntax": "ecmascript",
                    "jsx": jsx,
                },
                "minify": {
                    "compress": true,
                    "mangle": true
                },
                "transform": {
                    "react": {
                      "pragma": assets_config.pragma,
                      "pragmaFrag": assets_config.pragma_frag,
                      "runtime": "classic"
                    }
                }
            },
            "module": {
                "type": "es6"
            }
        });
        let mut options = from_value::<Options>(options).map_err(ErrorInternalServerError)?;

        if server_config.source_maps {
            options.source_maps = Some(SourceMapsConfig::Str("inline".to_string()));
        }

        let code = GLOBALS.set(&Default::default(), || {
            c.process_js_file(fm, &handler, &options)
                .map(|transformed| transformed.code)
                .map_err(ErrorInternalServerError)
        })?;

        responses::Cache::set(src, code)?
    };

    responses::file(file, src)
}
