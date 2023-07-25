use super::index::*;
use crate::{error::AppError, state::AppState};
use axum::{
	extract::{Path, State},
	response::Response,
};
use std::sync::Arc;

pub async fn posts_index(app_state: State<Arc<AppState>>) -> Result<Response, AppError> {
	index(app_state, Path("posts".to_string())).await
}
