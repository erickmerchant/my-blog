use crate::{models::cache, routes::not_found, AppError, AppState};
use axum::{
    extract::Path, extract::State, http::header, response::IntoResponse, response::Response,
};
use etag::EntityTag;
use lightningcss::{stylesheet, targets};
use parcel_sourcemap::SourceMap;
use sea_orm::{entity::prelude::*, query::*, ActiveValue::Set};
use std::{fs, path, sync::Arc};

pub async fn css(
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
        None => match fs::read_to_string(&src) {
            Err(_) => None,
            Ok(file_contents) => {
                let file_contents = file_contents.as_str();
                let targets = targets::Browsers::from_browserslist(
                    fs::read_to_string("./.browserslistrc")
                        .unwrap_or("supports es6-module and last 2 versions".to_string())
                        .trim()
                        .split('\n'),
                )
                .unwrap_or_default();
                let parser_options = stylesheet::ParserOptions {
                    nesting: true,
                    ..Default::default()
                };
                let minifier_options = stylesheet::MinifyOptions {
                    targets,
                    ..Default::default()
                };
                let mut source_map = None;

                let source_maps = envmnt::is("SOURCE_MAPS");

                if source_maps {
                    let mut sm = SourceMap::new("/");

                    if let Some(src_str) = src.to_str() {
                        sm.add_source(src_str);
                    };

                    if sm.set_source_content(0, file_contents).is_ok() {
                        source_map = Some(sm)
                    };
                };

                let printer_options = stylesheet::PrinterOptions {
                    minify: true,
                    targets,
                    source_map: source_map.as_mut(),
                    ..Default::default()
                };
                let mut stylesheet = stylesheet::StyleSheet::parse(file_contents, parser_options)
                    .map_err(|err| anyhow::anyhow!("{:?}", err))?;

                stylesheet.minify(minifier_options)?;

                let css = stylesheet.to_css(printer_options)?;
                let mut code = css.code;

                if let Some(mut source_map) = source_map {
                    let mut vlq_output = Vec::<u8>::new();

                    source_map.write_vlq(&mut vlq_output).ok();

                    if let Ok(source_map_data_url) = source_map.to_data_url(None) {
                        code.push_str(
                            format!("\n/*# sourceMappingURL={} */", &source_map_data_url).as_str(),
                        );
                    }
                };

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
        },
        Some(cache_result) => Some((cache_result.etag, cache_result.body)),
    };

    match cache_result {
        None => Ok(not_found(State(app_state))),
        Some((etag, body)) => Ok((
            [
                (header::CONTENT_TYPE, "text/css".to_string()),
                (header::ETAG, etag),
            ],
            body,
        )
            .into_response()),
    }
}
