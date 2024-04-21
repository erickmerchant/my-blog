use super::not_found::not_found_handler;
use axum::{
	extract::{Path, State},
	http::header,
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use std::{fs, sync::Arc};

pub async fn asset_handler(
	State(templates): State<Arc<crate::templates::Engine>>,
	Path(path): Path<String>,
) -> Result<Response, crate::Error> {
	let path = Utf8Path::new("public").join(path);
	if let Some(ext) = path.extension() {
		let path = path.with_extension("").with_extension(ext);
		let asset = mime_guess::from_ext(ext)
			.first()
			.map(|content_type| (content_type, fs::read(path)));

		if let Some((content_type, Ok(body))) = asset {
			return Ok(([(header::CONTENT_TYPE, content_type.to_string())], body).into_response());
		}
	}

	not_found_handler(State(templates)).await
}
