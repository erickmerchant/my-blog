use crate::{config, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use actix_web_lab::extract;
use serde_json::{from_value, json};
use std::{convert::AsRef, env::var, path::Path, sync::Arc};
use swc::{config::Options, config::SourceMapsConfig};
use swc_common::{errors::ColorConfig, errors::Handler, SourceMap, GLOBALS};

pub async fn js(
    extract::Path((file, ext)): extract::Path<(String, String)>,
    theme_config: web::Data<config::ThemeConfig>,
) -> Result<NamedFile> {
    let jsx = ext == *"jsx";
    let src = Path::new("theme").join(file).with_extension(ext);

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
                "targets": theme_config.targets,
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
                      "pragma": theme_config.pragma,
                      "pragmaFrag": theme_config.pragma_frag,
                      "runtime": "classic"
                    }
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

        responses::Cache::set(src, code)?
    };

    responses::file(file, src)
}
