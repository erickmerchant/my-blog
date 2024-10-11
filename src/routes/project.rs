use super::not_found;
use axum::{
	extract::{Path, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use std::sync::Arc;

pub async fn handler(
	State(state): State<Arc<crate::State>>,
	Path(project): Path<String>,
) -> Result<Response, crate::Error> {
	let path = format!("projects/{project}/index.html");

	if let Ok(body) = state.public.clone().read(path).await {
		return Ok((
			StatusCode::OK,
			[(header::CONTENT_TYPE, mime::TEXT_HTML.to_string())],
			body,
		)
			.into_response());
	}

	not_found::handler(State(state)).await
}
