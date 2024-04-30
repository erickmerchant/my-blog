mod assets;
mod import_map;

use assets::rewrite_assets;
use axum::{
	body::Body,
	http::{header, Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use etag::EntityTag;
use http_body_util::BodyExt;
use hyper::header::HeaderValue;
use std::fs;

const HTML_TYPE: &str = "text/html; charset=utf-8";
const ETAGABLE_TYPES: &[&str] = &[HTML_TYPE, "application/rss+xml; charset=utf-8"];

pub async fn layer(req: Request<Body>, next: Next) -> Result<Response, crate::Error> {
	let (req_parts, req_body) = req.into_parts();
	let mut cache_path = req_parts.uri.path().to_string();

	if cache_path.ends_with('/') {
		cache_path.push_str("index.html");
	}

	cache_path.insert_str(0, "storage");

	let cache_path = Utf8Path::new(&cache_path);

	if let Some(ext) = &cache_path.extension() {
		if let Some(content_type) = mime_guess::from_ext(ext).first() {
			let content_type = format!("{}; charset=utf-8", content_type);

			if ETAGABLE_TYPES.contains(&content_type.as_str()) {
				if let Ok(cached_body) = fs::read_to_string(cache_path) {
					if let Some(if_none_match) = req_parts.headers.get("if-none-match") {
						let etag = EntityTag::from_data(cached_body.as_bytes()).to_string();

						if etag == *if_none_match {
							return Ok((StatusCode::NOT_MODIFIED).into_response());
						}
					}

					return Ok((
						StatusCode::OK,
						[(header::CONTENT_TYPE, content_type)],
						cached_body,
					)
						.into_response());
				}
			}
		}
	}

	let res = next
		.run(Request::from_parts(req_parts.clone(), req_body))
		.await;

	let (mut parts, body) = res.into_parts();

	if let Some(content_type) = &parts.headers.get("content-type") {
		if ETAGABLE_TYPES.contains(&content_type.to_str().expect("should be a valid string")) {
			let new_body = body.collect().await?;
			let rewritten_body = rewrite_assets(new_body.to_bytes().clone())?;

			let etag = EntityTag::from_data(&rewritten_body).to_string();

			fs::create_dir_all(cache_path.with_file_name("")).ok();
			fs::write(cache_path, &rewritten_body).ok();

			if let Some(if_none_match) = req_parts.headers.get("if-none-match") {
				if etag == *if_none_match {
					return Ok((StatusCode::NOT_MODIFIED).into_response());
				}
			}

			let body = Body::from(rewritten_body);
			parts.headers.insert("etag", HeaderValue::from_str(&etag)?);

			return Ok(Response::from_parts(parts, body).into_response());
		} else {
			parts.headers.insert(
				"cache-control",
				HeaderValue::from_static("public, max-age=31536000, immutable"),
			);

			return Ok(Response::from_parts(parts, body).into_response());
		}
	};

	Ok(Response::from_parts(parts, body).into_response())
}
