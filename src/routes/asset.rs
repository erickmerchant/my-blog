use super::not_found;
use crate::{error, filesystem::*, layers::html::apply_html_layer, state};
use axum::{
	body::Body,
	extract::{Path, Query, Request, State},
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

pub async fn asset_handler(
	State(state): State<Arc<state::State>>,
	Path(path): Path<String>,
	query: Query<Version>,
	req: Request<Body>,
) -> Result<Response, error::Error> {
	let mut path = path;

	if path.ends_with('/') {
		path = format!("{path}index.html")
	}

	if let Some(content_type) = mime_guess::from_path(&path).first() {
		if let Ok(body) = read(Utf8Path::new(&state.base_dir).join(format!("public/{path}"))).await
		{
			if content_type == mime::TEXT_HTML {
				let (req_parts, _) = req.into_parts();
				let headers = &req_parts.headers;
				let if_none_match = headers.get(header::IF_NONE_MATCH);
				let uri = &req_parts.uri;
				let res = (
					StatusCode::OK,
					[(header::CONTENT_TYPE, content_type.to_string())],
					body,
				)
					.into_response();

				return apply_html_layer(State(state), if_none_match, uri, res).await;
			}

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

	not_found::not_found_handler(State(state)).await
}
