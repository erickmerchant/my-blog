use super::not_found;
use crate::filesystem::*;
use axum::{
	extract::{Path, Query, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use serde::Deserialize;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct Version {
	pub v: Option<String>,
}

pub async fn handler(
	State(state): State<Arc<crate::State>>,
	Path(path): Path<String>,
	query: Query<Version>,
) -> Result<Response, crate::Error> {
	if let Some(content_type) = mime_guess::from_path(&path).first() {
		if let Ok(body) = read(Utf8Path::new(&state.base_dir).join(format!("public/{path}"))).await
		{
			return Ok((
				StatusCode::OK,
				[
					(header::CONTENT_TYPE, content_type.to_string()),
					(
						header::CACHE_CONTROL,
						if query.v.is_some() {
							"public, max-age=31536000, immutable".to_string()
						} else {
							"public, max-age=86400".to_string()
						},
					),
				],
				body,
			)
				.into_response());
		}
	}

	not_found::handler(State(state)).await
}
