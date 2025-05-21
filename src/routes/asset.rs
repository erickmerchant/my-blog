use super::not_found;
use crate::{error, routes::page, state};
use axum::{
	extract::{Request, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use std::{fs, path, sync::Arc};

pub async fn asset_handler(
	State(state): State<Arc<state::State>>,
	req: Request,
) -> Result<Response, error::Error> {
	let path = req.uri().path().to_string();

	if path.ends_with("/") || path.ends_with(".html") {
		return page::page_handler(State(state), req).await;
	}

	let path = path.trim_start_matches("/");
	let path = path::Path::new(path);
	let mut has_hash = false;
	let file_name_parts: Vec<&str> = path
		.file_name()
		.and_then(|name| name.to_str())
		.map(|name| name.split('.').collect())
		.unwrap_or_default();

	if file_name_parts.len() == 3 {
		has_hash = true;
	}

	let content_type = if path.extension().is_some_and(|ext| ext == "rss") {
		Some("application/rss+xml".to_string())
	} else {
		mime_guess::from_path(path)
			.first()
			.map(|mime| mime.to_string())
	};

	if let (Some(content_type), Ok(body)) = (
		content_type,
		fs::read(
			path::Path::new(&state.args.base_dir)
				.join("dist")
				.join(path),
		),
	) {
		return Ok((
			StatusCode::OK,
			[
				(header::CONTENT_TYPE, content_type),
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
