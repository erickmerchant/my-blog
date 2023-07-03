use crate::mime::get_mime;
use axum::{http::header, http::StatusCode, http::Uri, response::IntoResponse, response::Response};
use camino::Utf8Path;
use std::fs;

pub async fn asset(uri: Uri) -> Response {
	let mut response: Option<Response> = None;
	let uri = Utf8Path::new("theme").join(uri.path().trim_start_matches('/'));

	if let Some(ext) = uri.extension() {
		let uri = uri.with_extension("").with_extension(ext);
		let asset = get_mime(Some(ext)).map(|content_type| (content_type, fs::read(uri)));

		if let Some((content_type, Ok(body))) = asset {
			let cache_control = if envmnt::is("APP_DEV") {
				"no-cache".to_string()
			} else {
				let year_in_seconds = 60 * 60 * 24 * 365;

				format!("public, max-age={year_in_seconds}, immutable")
			};

			response = Some(
				(
					[
						(header::CONTENT_TYPE, content_type),
						(header::CACHE_CONTROL, cache_control),
					],
					body,
				)
					.into_response(),
			);
		}
	}

	if let Some(response) = response {
		response
	} else {
		StatusCode::NOT_FOUND.into_response()
	}
}
