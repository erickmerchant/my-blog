use crate::error::AppError;
use axum::{http::header, http::StatusCode, http::Uri, response::IntoResponse, response::Response};
use std::{fs, path};

pub async fn asset(uri: Uri) -> Result<Response, AppError> {
	let file = &uri.path().to_string();
	let file = file.trim_start_matches('/').to_string();

	match file.ends_with(".jinja") {
		true => Ok(StatusCode::FORBIDDEN.into_response()),
		false => {
			let src = path::Path::new("theme").join(&file);
			let content_type = mime_guess::from_path(&src).first_or_text_plain();

			let cache_control_header = if envmnt::is("APP_DEV") {
				"no-cache"
			} else {
				"public, max-age=2419200"
			};

			match fs::read(src).ok() {
				None => Ok(StatusCode::NOT_FOUND.into_response()),
				Some(body) => Ok((
					[
						(header::CONTENT_TYPE, content_type.as_ref()),
						(header::CACHE_CONTROL, cache_control_header),
					],
					body,
				)
					.into_response()),
			}
		}
	}
}
