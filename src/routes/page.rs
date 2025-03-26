use super::not_found;
use crate::{error, state};
use axum::{
	extract::{Request, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use std::{fs, sync::Arc};

pub async fn page_handler(
	State(state): State<Arc<state::State>>,
	req: Request,
) -> Result<Response, error::Error> {
	let path = req.uri().path();
	let is_index = path.ends_with("/");
	let path = Utf8Path::new(path);
	let path = if is_index {
		path.join("index.html")
	} else {
		path.to_path_buf()
	};

	if let Ok(body) =
		fs::read(Utf8Path::new(&state.base_dir).join("public/".to_string() + path.as_str()))
	{
		return Ok((
			StatusCode::OK,
			[(header::CONTENT_TYPE, mime::HTML.to_string())],
			body,
		)
			.into_response());
	}

	not_found::not_found_handler(State(state)).await
}
