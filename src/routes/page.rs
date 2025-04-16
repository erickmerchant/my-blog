use super::not_found;
use crate::{error, state};
use axum::{
	extract::{Request, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use std::{fs, sync::Arc};

pub async fn page_handler(
	State(state): State<Arc<state::State>>,
	req: Request,
) -> Result<Response, error::Error> {
	let mut path = req.uri().path().to_string();
	let is_index = path.ends_with("/");

	if is_index {
		path = path.to_owned() + "index.html";
	}

	if let Ok(body) =
		fs::read(state.args.base_dir.trim_end_matches("/").to_string() + "/public/" + &path)
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
