use axum::{
	body::Body,
	http::{header, Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use etag::EntityTag;
use http_body_util::BodyExt;
use std::fs;

pub async fn layer(req: Request<Body>, next: Next) -> Result<Response, crate::Error> {
	let mut cache_path = req.uri().path().trim_start_matches('/').to_string();

	if cache_path.is_empty() || cache_path.ends_with('/') {
		cache_path = format!("{cache_path}index.html");
	}

	let cache_path = Utf8Path::new("storage").join(cache_path);
	let (req_parts, req_body) = req.into_parts();
	let content_type = mime_guess::from_path(cache_path.clone())
		.first()
		.map(|content_type| format!("{}; charset=utf-8", content_type))
		.unwrap_or("text/html; charset=utf-8".to_string());
	let body = if let Ok(cached_body) = fs::read_to_string(cache_path.clone()) {
		cached_body.as_bytes().to_vec()
	} else {
		let res = next
			.run(Request::from_parts(req_parts.clone(), req_body))
			.await;
		let body = res.into_body();
		let body = body.collect().await?;
		let body = body.to_bytes().to_vec();

		fs::create_dir_all(cache_path.with_file_name("")).ok();
		fs::write(cache_path, &body).ok();

		body
	};
	let etag = EntityTag::from_data(&body).to_string();

	if req_parts
		.headers
		.get("if-none-match")
		.map_or(false, |if_none_match| etag == *if_none_match)
	{
		Ok((StatusCode::NOT_MODIFIED).into_response())
	} else {
		Ok((
			StatusCode::OK,
			[
				(header::CONTENT_TYPE, content_type.to_string()),
				(header::ETAG, etag),
			],
			body,
		)
			.into_response())
	}
}
