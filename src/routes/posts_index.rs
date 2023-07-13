use crate::{error::AppError, routes::index, state::AppState};
use axum::{
	extract::{Path, State},
	http::Uri,
	response::Response,
};
use std::sync::Arc;

pub async fn handler(app_state: State<Arc<AppState>>, uri: Uri) -> Result<Response, AppError> {
	index::handler(app_state, Path("posts".to_string()), uri).await
}
