use crate::AppState;
use axum::{extract::State, http::StatusCode};
use std::sync::Arc;

pub fn internal_error(State(app_state): State<Arc<AppState>>) -> (StatusCode, String) {
    let title = "Internal Error".to_string();
    let description = "An error occurred. Please try again later.".to_string();

    super::error(
        app_state,
        StatusCode::INTERNAL_SERVER_ERROR,
        title,
        description,
    )
}
