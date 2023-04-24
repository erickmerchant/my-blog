use super::index::index;
use crate::{AppError, AppState};
use axum::{extract::Path, extract::State, response::Response};
use std::sync::Arc;

pub async fn posts_index(State(app_state): State<Arc<AppState>>) -> Result<Response, AppError> {
    index(State(app_state), Path("posts.html".to_string())).await
}
