use crate::{models::cache, routes::not_found, AppError, AppState};
use axum::{
    extract::Path, extract::State, http::header, response::IntoResponse, response::Response,
};
use etag::EntityTag;
use sea_orm::{entity::prelude::*, query::*, ActiveValue::Set};
use serde_json::{from_value, json};
use std::{fs, path, sync::Arc};
use swc::{config::Options, config::SourceMapsConfig};
use swc_common::{errors::ColorConfig, errors::Handler, SourceMap, GLOBALS};

pub async fn js(
    State(app_state): State<Arc<AppState>>,
    Path(file): Path<String>,
) -> Result<Response, AppError> {
    let src = path::Path::new("theme").join(&file);
    let cache_result: Option<cache::Model> = if envmnt::is("NO_CACHE") {
        None
    } else {
        cache::Entity::find()
            .filter(Condition::all().add(cache::Column::Path.eq(&file)))
            .one(&app_state.database.clone())
            .await?
    };

    let cache_result: Option<(String, Vec<u8>)> = match cache_result {
        None => {
            let targets = fs::read_to_string("./.browserslistrc")
                .unwrap_or("supports es6-module and last 2 versions".to_string());
            let src = src;
            let cm = Arc::<SourceMap>::default();
            let handler = Arc::new(Handler::with_tty_emitter(
                ColorConfig::Auto,
                true,
                false,
                Some(cm.clone()),
            ));
            let c = swc::Compiler::new(cm.clone());
            match cm.load_file(&src) {
                Err(_) => None,
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

                    let code_bytes = code.as_bytes().to_vec();

                    let etag = EntityTag::from_data(&code_bytes).to_string();
                    let body = code_bytes;

                    if !envmnt::is("NO_CACHE") {
                        let cache_model = cache::ActiveModel {
                            path: Set(file.clone()),
                            etag: Set(etag.clone()),
                            body: Set(body.clone()),
                            ..Default::default()
                        };

                        cache_model.clone().insert(&app_state.database).await?;
                    };

                    Some((etag, body))
                }
            }
        }
        Some(cache_result) => Some((cache_result.etag, cache_result.body)),
    };

    match cache_result {
        None => Ok(not_found(State(app_state))),
        Some((etag, body)) => Ok((
            [
                (header::CONTENT_TYPE, "application/javascript".to_string()),
                (header::ETAG, etag),
            ],
            body,
        )
            .into_response()),
    }
}
