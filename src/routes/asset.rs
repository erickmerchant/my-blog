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
	let file_name_parts: Vec<&str> = path
		.file_name()
		.map(|name| name.split('.').collect::<_>())
		.unwrap_or_default();

	if file_name_parts.len() == 3 && file_name_parts[1].len() == 10 {
		has_hash = true;

		path = path
			.with_file_name(file_name_parts[0])
			.with_extension(file_name_parts[2]);
	}

	let content_type = mime_guess::from_path(&path).first();

	if content_type == Some(mime::TEXT_HTML) {
		let headers = &req.headers();

		return apply_html_layer(
			State(state.clone()),
			headers,
			path.to_string(),
			async move || {
				let body = fs::read(
					Utf8Path::new(&state.base_dir).join("public/".to_string() + path.as_str()),
				)
				.unwrap_or_default();

				Ok((
					StatusCode::OK,
					[(header::CONTENT_TYPE, mime::TEXT_HTML.to_string())],
					body,
				)
					.into_response())
			},
		)
		.await;
	}

	if let (Some(content_type), Ok(body)) = (
		content_type,
		fs::read(Utf8Path::new(&state.base_dir).join("public/".to_string() + path.as_str())),
	) {
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
