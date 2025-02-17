use super::not_found;
use crate::{error, layers::html::apply_html_layer, state};
use axum::{
	body::Body,
	extract::{Path, Request, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use std::{fs, sync::Arc};

pub async fn asset_handler(
	State(state): State<Arc<state::State>>,
	Path(path): Path<String>,
	req: Request<Body>,
) -> Result<Response, error::Error> {
	let is_index = path.ends_with("/");
	let path = Utf8Path::new(path.as_str());
	let path = if is_index {
		path.join("index.html")
	} else {
		path.to_path_buf()
	};
	let mut has_hash = false;
	let mut path = path.to_path_buf();

	if let Some(ext) = path.extension() {
		let p = path.with_extension("");

		if let Some(hash) = p.extension() {
			let p = p.with_extension("");

			if hash.len() == 10 {
				has_hash = true;

				path = p.with_extension(ext)
			}
		}
	};

	if let (Some(content_type), Ok(body)) = (
		mime_guess::from_path(&path).first(),
		fs::read(Utf8Path::new(&state.base_dir).join(format!("public/{path}"))),
	) {
		if content_type == mime::TEXT_HTML {
			let (req_parts, _) = req.into_parts();
			let headers = &req_parts.headers;
			let uri = &req_parts.uri;
			let res = (
				StatusCode::OK,
				[(header::CONTENT_TYPE, content_type.to_string())],
				body,
			)
				.into_response();

			return apply_html_layer(State(state), headers, uri, res).await;
		}

		return Ok((
			StatusCode::OK,
			[
				(header::CONTENT_TYPE, content_type.to_string()),
				(
					header::CACHE_CONTROL,
					if has_hash {
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

	not_found::not_found_handler(State(state)).await
}
