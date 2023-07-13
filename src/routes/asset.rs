use crate::{error::AppError, routes::not_found, state::AppState};
use axum::{
	extract::State,
	http::{header, StatusCode, Uri},
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use std::{fs, sync::Arc};

pub async fn handler(
	State(app_state): State<Arc<AppState>>,
	uri: Uri,
) -> Result<Response, AppError> {
	let mut response: Option<Response> = None;
	let uri = Utf8Path::new("theme").join(uri.path().trim_start_matches('/'));

	if let Some(ext) = uri.extension() {
		let uri = uri.with_extension("").with_extension(ext);
		let asset = mime_guess::from_ext(ext)
			.first()
			.map(|content_type| (content_type, fs::read(uri)));

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
						(header::CONTENT_TYPE, content_type.to_string()),
						(header::CACHE_CONTROL, cache_control),
					],
					body,
				)
					.into_response(),
			);
		} else {
			response = Some(StatusCode::NOT_FOUND.into_response());
		}
	}

	if let Some(response) = response {
		Ok(response)
	} else {
		not_found::handler(State(app_state))
	}
}
