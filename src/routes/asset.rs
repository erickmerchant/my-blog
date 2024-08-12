use super::not_found;
use axum::{
	extract::Request,
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use tokio::fs;

pub async fn handler(request: Request) -> Result<Response, crate::Error> {
	let path = request.uri().path().trim_start_matches('/').to_string();
	let is_index = path.ends_with('/');
	let mut path = Utf8Path::new("public").join(path);

	if is_index {
		path.push("index.html");
	}

	if let Some(content_type) = mime_guess::from_path(&path).first() {
		if let Ok(body) = fs::read(path).await {
			return Ok((
				StatusCode::OK,
				[(header::CONTENT_TYPE, content_type.to_string())],
				body,
			)
				.into_response());
		}
	}

	not_found::handler().await
}
