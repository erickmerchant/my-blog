use super::asset;
use crate::{error, state};
use axum::{
	body::Body,
	extract::{Path, Query, Request, State},
	response::Response,
};
use std::sync::Arc;

pub async fn cached_asset_handler(
	State(state): State<Arc<state::State>>,
	Path((v, path)): Path<(String, String)>,
	req: Request<Body>,
) -> Result<Response, error::Error> {
	asset::asset_handler(
		State(state),
		Path(path),
		Query(asset::Version { v: Some(v) }),
		req,
	)
	.await
}
