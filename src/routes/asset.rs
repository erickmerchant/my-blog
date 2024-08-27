use super::not_found;
use axum::{
	extract::{Path, Query},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use serde::Deserialize;
use tokio::fs;

#[allow(dead_code)]
#[derive(Deserialize)]
pub struct Params {
	pub v: String,
}

pub async fn handler(
	Path(path): Path<String>,
	params: Option<Query<Params>>,
) -> Result<Response, crate::Error> {
	let is_index = path.ends_with('/');
	let mut path = Utf8Path::new("public").join(path);

	if is_index {
		path.push("index.html");
	}

	if let Some(content_type) = mime_guess::from_path(&path).first() {
		if let Ok(body) = fs::read(path).await {
			return Ok((
				StatusCode::OK,
				[
					(header::CONTENT_TYPE, content_type.to_string()),
					(
						header::CACHE_CONTROL,
						if params.is_some() {
							"public, max-age=31536000, immutable".to_string()
						} else {
							"public, max-age=86400".to_string()
						},
					),
				],
				body,
			)
				.into_response());
		}
	}

	not_found::handler().await
}
