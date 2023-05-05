use crate::{error::AppError, models::cache, routes::not_found, state::AppState};
use axum::{
    extract::Path, extract::State, http::header, http::Uri, response::IntoResponse,
    response::Response,
};
use lightningcss::{stylesheet, targets};
use parcel_sourcemap::SourceMap;
use std::{fs, path, sync::Arc};

pub async fn css(
    State(app_state): State<Arc<AppState>>,
    Path(file): Path<String>,
    uri: Uri,
) -> Result<Response, AppError> {
    let content_type = "text/css".to_string();
    let src = path::Path::new("theme").join(&file);

    match fs::read_to_string(&src).ok() {
        None => Ok(not_found(State(app_state))),
        Some(file_contents) => {
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

            let body = code.as_bytes().to_vec();
            let etag = cache::save(
                &app_state,
                uri.to_string(),
                content_type.to_string(),
                body.clone(),
            )
            .await;

            Ok((
                [(header::CONTENT_TYPE, content_type), (header::ETAG, etag)],
                body,
            )
                .into_response())
        }
    }
}
