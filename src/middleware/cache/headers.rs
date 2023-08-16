use super::ETAGABLE_TYPES;
use axum::http::header;
use hyper::{header::HeaderValue, HeaderMap};

pub fn get_header(headers: HeaderMap, key: String) -> Option<String> {
	headers
		.get(key)
		.and_then(|h| h.to_str().ok())
		.map(|h| h.to_string())
}

pub fn add_cache_headers(
	mut headers: HeaderMap,
	content_type: String,
	etag: Option<String>,
) -> HeaderMap {
	let cache_control = format!("public, max-age={}, immutable", 60 * 60 * 24 * 365);

	HeaderValue::from_str(content_type.as_str())
		.ok()
		.and_then(|v| headers.insert(header::CONTENT_TYPE, v));

	if ETAGABLE_TYPES.contains(&content_type.as_str()) {
		if let Some(etag) = etag {
			HeaderValue::from_str(etag.as_str())
				.ok()
				.and_then(|v| headers.insert(header::ETAG, v));
		}
	} else {
		HeaderValue::from_str(cache_control.as_str())
			.ok()
			.and_then(|v| headers.insert(header::CACHE_CONTROL, v));
	}

	headers
}
