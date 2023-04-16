use crate::AppState;
use axum::{extract::State, http::StatusCode};
use std::sync::Arc;

pub fn not_found(State(app_state): State<Arc<AppState>>) -> (StatusCode, String) {
    let title = "Page Not Found".to_string();
    let description = "That page was moved, removed, or never existed.".to_string();

    super::error(app_state, StatusCode::NOT_FOUND, title, description)
}
