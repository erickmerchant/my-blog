use super::not_found;
use crate::{error, state};
use axum::{
	extract::{Request, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use etag::EntityTag;
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

	let headers = &req.headers().clone();
	let if_none_match = headers.get(header::IF_NONE_MATCH);

	if let Ok(body) =
		fs::read(state.args.base_dir.trim_end_matches("/").to_string() + "/dist/" + &path)
	{
		let etag = EntityTag::from_data(&body).to_string();

		if if_none_match.is_some_and(|if_none_match| etag == *if_none_match) {
			return Ok(StatusCode::NOT_MODIFIED.into_response());
		}

		return Ok((
			StatusCode::OK,
			[
				(header::CONTENT_TYPE, mime::HTML.to_string()),
				(header::ETAG, etag),
			],
			body,
		)
			.into_response());
	}

	not_found::not_found_handler(State(state)).await
}
