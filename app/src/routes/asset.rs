use crate::routes::{css, js, not_found};
use crate::{AppError, AppState};
use axum::{
    extract::Path, extract::State, http::header, http::header::HeaderValue, response::IntoResponse,
    response::Response,
};
use std::{fs, path, sync::Arc};

pub async fn asset(
    State(app_state): State<Arc<AppState>>,
    Path(file): Path<String>,
) -> Result<Response, AppError> {
    if file.ends_with(".js") {
        js(State(app_state), Path(file)).await
    } else if file.ends_with(".css") {
        css(State(app_state), Path(file)).await
    } else {
        let src = path::Path::new("theme").join(&file);
        let mime_type = mime_guess::from_path(&src).first_or_text_plain();

        match fs::read(&src) {
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
