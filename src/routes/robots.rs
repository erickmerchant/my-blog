use super::asset::asset;
use crate::{error::AppError, state::AppState};
use axum::{
	extract::{Path, State},
	response::Response,
};
use std::sync::Arc;

pub async fn robots(State(app_state): State<Arc<AppState>>) -> Result<Response, AppError> {
	asset(State(app_state), Path("/theme/robots.txt".to_string())).await
}
