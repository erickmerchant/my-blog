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

	if let Some((cache_control, content_type, body)) = path.clone().extension().and_then(|ext| {
		let new_path = path.with_extension("").with_extension(ext);
		let cache_control = if path == new_path {
			"public, max-age=0, must-revalidate"
		} else {
			"public, max-age=31536000, immutable"
		};

		mime_guess::from_ext(ext).first().and_then(|content_type| {
			fs::read(new_path)
				.ok()
				.map(|body| (cache_control, content_type, body))
		})
	}) {
		Ok((
			StatusCode::OK,
			[
				(header::CONTENT_TYPE, content_type.to_string()),
				(header::CACHE_CONTROL, cache_control.to_string()),
			],
			body,
		)
			.into_response())
	} else {
		not_found::handler().await
	}
}
