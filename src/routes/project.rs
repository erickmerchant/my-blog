use super::not_found;
use crate::filesystem::*;
use axum::{
	extract::{Path, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use std::sync::Arc;

pub async fn handler(
	State(state): State<Arc<crate::State>>,
	Path(project): Path<String>,
) -> Result<Response, crate::Error> {
	let path = format!("public/projects/{project}/index.html");

	if let Ok(body) = read(Utf8Path::new(&state.base_dir).join(path)).await {
		return Ok((
			StatusCode::OK,
			[(header::CONTENT_TYPE, mime::TEXT_HTML.to_string())],
			body,
		)
			.into_response());
	}

	not_found::handler(State(state)).await
}
