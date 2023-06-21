use crate::{error::AppError, mime::get_mime};
use axum::{http::header, http::StatusCode, http::Uri, response::IntoResponse, response::Response};
use std::{fs, path};

pub async fn asset(uri: Uri) -> Result<Response, AppError> {
	let uri_path = &uri.path();
	let file = uri_path.to_string().trim_start_matches('/').to_string();
	let content_type = get_mime(
		path::Path::new(uri_path)
			.extension()
			.and_then(|ext| ext.to_str()),
	);

	match content_type {
		None => Ok(StatusCode::NOT_FOUND.into_response()),
		Some(content_type) => {
			let src = path::Path::new("theme").join(file);
			let cache_control = if envmnt::is("APP_DEV") {
				"no-cache".to_string()
			} else {
				let year_in_seconds = 60 * 60 * 24 * 365;

				format!("public, max-age={}, immutable", year_in_seconds)
			};

			match fs::read(src).ok() {
				None => Ok(StatusCode::NOT_FOUND.into_response()),
				Some(body) => Ok((
					[
						(header::CONTENT_TYPE, content_type),
						(header::CACHE_CONTROL, cache_control),
					],
					body,
				)
					.into_response()),
			}
		}
	}
}
