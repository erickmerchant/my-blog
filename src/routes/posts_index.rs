use super::index::index;
use crate::{error::AppError, state::AppState};
use axum::{extract::Path, extract::State, http::Uri, response::Response};
use std::sync::Arc;

pub async fn posts_index(app_state: State<Arc<AppState>>, uri: Uri) -> Result<Response, AppError> {
    index(app_state, Path("posts".to_string()), uri).await
}
