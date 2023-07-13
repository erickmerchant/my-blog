use crate::{error::AppError, routes::index, state::AppState};
use axum::{
	extract::{Path, State},
	http::Uri,
	response::Response,
};
use std::sync::Arc;

pub async fn route(app_state: State<Arc<AppState>>, uri: Uri) -> Result<Response, AppError> {
	index::route(app_state, Path("posts".to_string()), uri).await
}
