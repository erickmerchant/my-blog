use crate::{routes::not_found, AppError, AppState};
use axum::{
    extract::Path, extract::State, http::header, response::IntoResponse, response::Response,
};
use serde_json::{from_value, json};
use std::{convert::AsRef, fs, path, sync::Arc};
use swc::{config::Options, config::SourceMapsConfig};
use swc_common::{errors::ColorConfig, errors::Handler, SourceMap, GLOBALS};

pub async fn js(
    State(app_state): State<Arc<AppState>>,
    Path(file): Path<String>,
) -> Result<Response, AppError> {
    let src = path::Path::new("theme")
        .join(file.to_string())
        .with_extension("js");

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
    match cm.load_file(src) {
        Err(_) => Ok(not_found(State(app_state))),
        Ok(fm) => {
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
            let mut options = from_value::<Options>(options)?;

            let source_maps = envmnt::is("SOURCE_MAPS");

            if source_maps {
                options.source_maps = Some(SourceMapsConfig::Str("inline".to_string()));
            }

            let code = GLOBALS.set(&Default::default(), || {
                c.process_js_file(fm, &handler, &options)
                    .map(|transformed| transformed.code)
            })?;

            Ok(([(header::CONTENT_TYPE, "application/javascript")], code).into_response())
        }
    }
}
