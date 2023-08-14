use super::asset::asset;
use crate::error::AppError;
use axum::{extract::Path, response::Response};

pub async fn robots() -> Result<Response, AppError> {
	asset(Path("/theme/robots.txt".to_string())).await
}
