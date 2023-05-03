use crate::{
    error::AppError, models::cache, routes::css, routes::js, routes::not_found, state::AppState,
};
use axum::{
    extract::Path, extract::State, http::header, http::StatusCode, http::Uri,
    response::IntoResponse, response::Response,
};
use std::{fs, path, sync::Arc};

pub async fn asset(State(app_state): State<Arc<AppState>>, uri: Uri) -> Result<Response, AppError> {
    let file_string = &uri.to_string();
    let extension = path::Path::new(file_string)
        .extension()
        .expect("it should have an extension")
        .to_str();
    let file = file_string.trim_start_matches('/').to_string();

    match extension {
        Some("jinja") => Ok((StatusCode::FORBIDDEN).into_response()),
        Some("js") => js(State(app_state), Path(file), uri).await,
        Some("css") => css(State(app_state), Path(file), uri).await,
        _ => {
            let src = path::Path::new("theme").join(&file);
            let content_type = mime_guess::from_path(&src).first_or_text_plain();

            match fs::read(src).ok() {
                None => Ok(not_found(State(app_state))),
                Some(file_contents) => {
                    let body = file_contents;
                    let etag = cache::save(
                        &app_state,
                        uri.to_string(),
                        content_type.to_string(),
                        body.clone(),
                    )
                    .await;

                    Ok((
                        [
                            (header::CONTENT_TYPE, content_type.as_ref()),
                            (header::ETAG, etag.as_str()),
                        ],
                        body,
                    )
                        .into_response())
                }
            }
        }
    }
}
