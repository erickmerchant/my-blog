mod assets;
mod headers;
mod import_map;

use crate::models::cache::Model;
use assets::rewrite_assets;
use axum::{
	body::Body,
	http::{Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
};
use etag::EntityTag;
use headers::{add_cache_headers, etag_matches, get_header};
use http_body_util::BodyExt;
use hyper::HeaderMap;
use std::{
	fs::{create_dir_all, read_to_string, write},
	path::Path,
};

const ETAGABLE_TYPES: &[&str] = &[
	"text/html; charset=utf-8",
	"application/rss+xml; charset=utf-8",
];

pub async fn cache_layer(req: Request<Body>, next: Next) -> Result<Response, crate::Error> {
	let uri_path = req.uri().path().to_string();
	let mut cache_path = Path::new("storage").join(uri_path.trim_start_matches("/"));

	if cache_path.to_string_lossy().to_string().ends_with("/") {
		cache_path = cache_path.join("index");
	}

	let cache_result = read_to_string(&cache_path)
		.map(|contents| toml::from_str::<Model>(&contents))
		.ok();
	let req_headers = req.headers().clone();

	if let Some(Ok(cache_result)) = cache_result {
		let etag_matches = etag_matches(&cache_result.etag, &req_headers);

		if etag_matches {
			return Ok(StatusCode::NOT_MODIFIED.into_response());
		}

		let mut headers = HeaderMap::new();

		add_cache_headers(&mut headers, cache_result.content_type, cache_result.etag);

		return Ok((headers, cache_result.body).into_response());
	}

	let res = next.run(req).await;

	if res.status() == StatusCode::OK {
		let (mut parts, body) = res.into_parts();
		let bytes = BodyExt::collect(body).await?.to_bytes();
		let mut output = Vec::new();

		if let Some(content_type) = get_header(&parts.headers, "content-type".to_string()) {
			let mut etag = None;

			if ETAGABLE_TYPES.contains(&content_type.as_str()) {
				output = rewrite_assets(bytes, output)?;

				let etag_string = EntityTag::from_data(&output).to_string();

				etag = Some(etag_string.clone());

				let cache_model = Model {
					content_type: content_type.clone(),
					etag: etag.clone(),
					body: output.clone(),
				};

				create_dir_all(&cache_path.with_file_name(""))?;

				write(
					cache_path,
					toml::to_string(&cache_model).expect("should serialize toml"),
				)?;

				let etag_matches = etag_matches(&etag, &req_headers);

				if etag_matches {
					return Ok(StatusCode::NOT_MODIFIED.into_response());
				}
			} else {
				output = bytes.to_vec();
			};

			add_cache_headers(&mut parts.headers, content_type, etag);
		} else {
			output = bytes.to_vec();
		};

		return Ok(Response::from_parts(parts, Body::from(output)).into_response());
	}

	Ok(res)
}
