mod assets;
mod import_map;

use assets::rewrite_assets;
use axum::{
	body::Body,
	http::Request,
	middleware::Next,
	response::{IntoResponse, Response},
};
use http_body_util::BodyExt;
use hyper::header::HeaderValue;

pub async fn cache_layer(req: Request<Body>, next: Next) -> Result<Response, crate::Error> {
	let res = next.run(req).await;

	let (mut parts, mut body) = res.into_parts();

	if let Some(content_type) = &parts.headers.get("content-type") {
		if *content_type == "text/html; charset=utf-8" {
			let bytes = BodyExt::collect(body).await?.to_bytes();
			let output = Vec::new();

			body = Body::from(rewrite_assets(bytes, output)?);
		} else if *content_type != "application/rss+xml; charset=utf-8" {
			parts.headers.insert(
				"cache-control",
				HeaderValue::from_static("public, max-age=31536000, immutable"),
			);
		};
	};

	Ok(Response::from_parts(parts, body).into_response())
}
