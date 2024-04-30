use super::not_found::not_found_handler;
use axum::{
	extract::Request,
	http::header,
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use std::fs;

pub async fn asset_handler(request: Request) -> Result<Response, crate::Error> {
	let path = request.uri().path().trim_start_matches('/');
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

	not_found_handler().await
}
