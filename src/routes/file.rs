use super::{asset, page};
use crate::{error, state};
use axum::{
	extract::{Request, State},
	response::Response,
};
use std::sync::Arc;

pub async fn file_handler(
	State(state): State<Arc<state::State>>,
	req: Request,
) -> Result<Response, error::Error> {
	let path = req.uri().path().to_string();

	if path.ends_with("/") || path.ends_with(".html") {
		page::page_handler(State(state), req).await
	} else {
		asset::asset_handler(State(state), req).await
	}
}
