use super::not_found;
use axum::{
	extract::{Path, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use std::sync::Arc;

pub async fn handler(
	State(state): State<Arc<crate::State>>,
	Path(path): Path<String>,
) -> Result<Response, crate::Error> {
	let is_index = path.ends_with('/');
	let mut path = path;

	if is_index {
		path = format!("{path}index.html");
	}

	if let Some(content_type) = mime_guess::from_path(&path).first() {
		if let Ok(body) = state.public.clone().read(path).await {
			return Ok((
				StatusCode::OK,
				[(header::CONTENT_TYPE, content_type.to_string())],
				body,
			)
				.into_response());
		}
	}

	not_found::handler(State(state)).await
}
