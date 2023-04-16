use crate::{error_routes::not_found, AppState};
use axum::{extract, http::StatusCode, response::Response};
use std::sync::Arc;
use std::{fs::File, path::Path};

pub async fn asset(
    extract::State(app_state): extract::State<Arc<AppState>>,
    extract::Path(file): extract::Path<String>,
) -> Response {
    match file.to_string().ends_with(".jinja") {
        true => not_found(extract::State(app_state)),
        false => {
            let src = Path::new("theme").join(file.to_string());

            if let Ok(file) = File::options().read(true).open(&src) {
                super::file(file, src)
            } else {
                not_found(extract::State(app_state))
            }
        }
    }
}
