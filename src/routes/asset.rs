use crate::{error::AppError, models::cache, state::AppState};
use axum::{
	extract::State, http::header, http::StatusCode, http::Uri, response::IntoResponse,
	response::Response,
};
use std::{fs, path, sync::Arc};

pub async fn asset(State(app_state): State<Arc<AppState>>, uri: Uri) -> Result<Response, AppError> {
	let file = &uri.to_string();
	let file = file.trim_start_matches('/').to_string();

	match file.ends_with(".jinja") {
		true => Ok(StatusCode::FORBIDDEN.into_response()),
		false => {
			let src = path::Path::new("theme").join(&file);
			let content_type = mime_guess::from_path(&src).first_or_text_plain();

			match fs::read(src).ok() {
				None => Ok(StatusCode::NOT_FOUND.into_response()),
				Some(body) => {
					let etag = cache::save(
						&app_state,
						uri.to_string(),
						content_type.to_string(),
						body.clone(),
					)
					.await;

					Ok((
						[
							(header::CONTENT_TYPE, content_type.as_ref()),
							(header::ETAG, etag.as_str()),
						],
						body,
					)
						.into_response())
				}
			}
		}
	}
}
