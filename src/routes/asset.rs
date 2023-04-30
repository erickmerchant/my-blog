use crate::routes::{css, js, not_found};
use crate::{AppError, AppState};
use axum::{
    extract::Path, extract::State, http::header, http::header::HeaderValue, http::StatusCode,
    http::Uri, response::IntoResponse, response::Response,
};
use std::{fs, path, sync::Arc};

pub async fn asset(
    State(app_state): State<Arc<AppState>>,
    file: Uri,
) -> Result<Response, AppError> {
    let file_string = &file.to_string();
    let extension = path::Path::new(file_string)
        .extension()
        .expect("it should have an extension")
        .to_str();
    let file = file_string.trim_start_matches('/').to_string();

    match extension {
        Some("jinja") => Ok((StatusCode::FORBIDDEN).into_response()),
        Some("js") => js(State(app_state), Path(file)).await,
        Some("css") => css(State(app_state), Path(file)).await,
        _ => {
            let src = path::Path::new("theme").join(&file);
            let mime_type = mime_guess::from_path(&src).first_or_text_plain();

            match fs::read(src) {
                Err(_) => Ok(not_found(State(app_state))),
                Ok(file_contents) => Ok((
                    [(
                        header::CONTENT_TYPE,
                        HeaderValue::from_str(mime_type.as_ref())?,
                    )],
                    file_contents,
                )
                    .into_response()),
            }
        }
    }
}
