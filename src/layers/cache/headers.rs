use axum::http::header;
use etag::EntityTag;
use hyper::{header::HeaderValue, HeaderMap};

pub fn get_header(headers: &HeaderMap, key: String) -> Option<String> {
	headers
		.get(key)
		.and_then(|h| h.to_str().ok())
		.map(|h| h.to_string())
}

pub fn add_cache_headers(headers: &mut HeaderMap, content_type: String, etag: Option<String>) {
	let cache_control = format!("public, max-age={}, immutable", 60 * 60 * 24 * 365);

	HeaderValue::from_str(content_type.as_str())
		.ok()
		.and_then(|v| headers.insert(header::CONTENT_TYPE, v));

	if let Some(etag) = etag {
		HeaderValue::from_str(etag.as_str())
			.ok()
			.and_then(|v| headers.insert(header::ETAG, v));
	} else {
		HeaderValue::from_str(cache_control.as_str())
			.ok()
			.and_then(|v| headers.insert(header::CACHE_CONTROL, v));
	}
}

pub fn etag_matches(etag: &Option<String>, req_headers: &HeaderMap) -> bool {
	etag.as_ref().map_or(false, |etag| {
		let etag = etag.parse::<EntityTag>().ok();
		let if_none_match = get_header(req_headers, "if-none-match".to_string())
			.and_then(|h| h.parse::<EntityTag>().ok());

		if let (Some(etag), Some(if_none_match)) = (etag, if_none_match) {
			etag.weak_eq(&if_none_match)
		} else {
			false
		}
	})
}
