use super::not_found::*;
use crate::{error::AppError, state::AppState};
use axum::{
	extract::State,
	http::{header, StatusCode, Uri},
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use std::{fs, sync::Arc};

pub async fn asset(State(app_state): State<Arc<AppState>>, uri: Uri) -> Result<Response, AppError> {
	let uri = Utf8Path::new("theme").join(uri.path().trim_start_matches('/'));

	if let Some(ext) = uri.extension() {
		let uri = uri.with_extension("").with_extension(ext);
		let asset = mime_guess::from_ext(ext)
			.first()
			.map(|content_type| (content_type, fs::read(uri)));

		if let Some((content_type, Ok(body))) = asset {
			Ok(([(header::CONTENT_TYPE, content_type.to_string())], body).into_response())
		} else {
			Ok(StatusCode::NOT_FOUND.into_response())
		}
	} else {
		not_found(State(app_state))
	}
}
