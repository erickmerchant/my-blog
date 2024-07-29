use super::not_found;
use axum::{
	extract::Request,
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use std::fs;

pub async fn handler(request: Request) -> Result<Response, crate::Error> {
	let path = request.uri().path().trim_start_matches('/');
	let path = Utf8Path::new("public").join(path);

	if let Some(ext) = path.clone().extension() {
		let new_path = path.with_extension("").with_extension(ext);
		let cache_control = if path == new_path {
			"public, max-age=0, must-revalidate"
		} else {
			"public, max-age=31536000, immutable"
		};

		if let Some(content_type) = mime_guess::from_ext(ext).first() {
			if let Ok(body) = fs::read(new_path) {
				return Ok((
					StatusCode::OK,
					[
						(header::CONTENT_TYPE, content_type.to_string()),
						(header::CACHE_CONTROL, cache_control.to_string()),
					],
					body,
				)
					.into_response());
			}
		}
	}

	not_found::handler().await
}
