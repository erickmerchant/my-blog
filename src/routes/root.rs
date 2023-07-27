use super::category::*;
use crate::{error::AppError, state::AppState};
use axum::{
	extract::{Path, State},
	response::Response,
};
use std::sync::Arc;

pub async fn root(app_state: State<Arc<AppState>>) -> Result<Response, AppError> {
	category(app_state, Path("posts".to_string())).await
}
