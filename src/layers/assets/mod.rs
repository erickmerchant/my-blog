use axum::{
	body::Body,
	http::{header, Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use std::fs;

pub async fn assets_layer(req: Request<Body>, next: Next) -> Result<Response, crate::Error> {
	let req_path = &req
		.uri()
		.path()
		.to_string()
		.trim_start_matches('/')
		.to_string();

	let res = next.run(req).await;

	if res.status() == StatusCode::NOT_FOUND {
		let uri = Utf8Path::new("public").join(req_path);

		if let Some(ext) = uri.extension() {
			let uri = uri.with_extension("").with_extension(ext);
			let asset = mime_guess::from_ext(ext)
				.first()
				.map(|content_type| (content_type, fs::read(uri)));

			if let Some((content_type, Ok(body))) = asset {
				return Ok(
					([(header::CONTENT_TYPE, content_type.to_string())], body).into_response()
				);
			} else {
				return Ok(StatusCode::NOT_FOUND.into_response());
			}
		}
	};

	Ok(res)
}
