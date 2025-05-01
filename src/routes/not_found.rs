use crate::{error, state};
use axum::{
	extract::State,
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use std::{fs, sync::Arc};

pub async fn not_found_handler(
	State(state): State<Arc<state::State>>,
) -> Result<Response, error::Error> {
	let path = "404.html".to_string();

	if let Ok(body) =
		fs::read(state.args.base_dir.trim_end_matches("/").to_string() + "/dist/" + &path)
	{
		return Ok((
			StatusCode::NOT_FOUND,
			[(header::CONTENT_TYPE, mime::HTML.to_string())],
			body,
		)
			.into_response());
	}

	Ok(StatusCode::NOT_FOUND.into_response())
}
