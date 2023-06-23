use crate::mime::get_mime;
use axum::{http::header, http::StatusCode, http::Uri, response::IntoResponse, response::Response};
use std::{fs, path};

pub async fn asset(uri: Uri) -> Response {
	let uri_path = &uri.path();
	let asset = get_mime(
		path::Path::new(uri_path)
			.extension()
			.and_then(|ext| ext.to_str()),
	)
	.map(|content_type| {
		let file = uri_path.to_string().trim_start_matches('/').to_string();
		let src = path::Path::new("assets").join(file);

		(content_type, fs::read(src))
	});

	if let Some((content_type, Ok(body))) = asset {
		let cache_control = if envmnt::is("APP_DEV") {
			"no-cache".to_string()
		} else {
			let year_in_seconds = 60 * 60 * 24 * 365;

			format!("public, max-age={}, immutable", year_in_seconds)
		};

		(
			[
				(header::CONTENT_TYPE, content_type),
				(header::CACHE_CONTROL, cache_control),
			],
			body,
		)
			.into_response()
	} else {
		StatusCode::NOT_FOUND.into_response()
	}
}
