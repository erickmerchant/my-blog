use super::index::index;
use crate::AppState;
use axum::extract;
use std::sync::Arc;

pub async fn posts_index(
    extract::State(app_state): extract::State<Arc<AppState>>,
) -> Result<NamedFile> {
    index(app_state, extract::Path::from("posts".to_string())).await
}
