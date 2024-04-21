mod assets;
mod headers;
mod import_map;

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
	fs::{create_dir_all, read_to_string, File},
	io::Write,
	path::Path,
};

const ETAGABLE_TYPES: &[&str] = &[
	"text/html; charset=utf-8",
	"application/rss+xml; charset=utf-8",
];

pub async fn cache_layer(req: Request<Body>, next: Next) -> Result<Response, crate::Error> {
	let uri_path = req.uri().path().to_string();
	let mut cache_path = Path::new("storage").join(uri_path.trim_start_matches('/'));

	if cache_path.to_string_lossy().to_string().ends_with('/') {
		cache_path = cache_path.join("index");
	}

	let cache_result = read_to_string(&cache_path).map(|contents| {
		let parts = contents
			.splitn(3, '\n')
			.map(|part| part.to_string())
			.collect::<Vec<_>>();

		(parts[0].clone(), parts[1].clone(), parts[2].clone())
	});
	let req_headers = req.headers().clone();

	if let Ok((etag, content_type, body)) = cache_result {
		let etag_matches = etag_matches(&Some(etag.clone()), &req_headers);

		if etag_matches {
			return Ok(StatusCode::NOT_MODIFIED.into_response());
		}

		let mut headers = HeaderMap::new();

		add_cache_headers(&mut headers, content_type, Some(etag));

		return Ok((headers, body).into_response());
	}

	let res = next.run(req).await;

	if res.status() == StatusCode::OK {
		let (mut parts, body) = res.into_parts();
		let bytes = BodyExt::collect(body).await?.to_bytes();
		let mut output = Vec::new();

		if let Some(content_type) = get_header(&parts.headers, "content-type".to_string()) {
			let etag = None;

			if ETAGABLE_TYPES.contains(&content_type.as_str()) {
				output = rewrite_assets(bytes, output)?;

				let etag = EntityTag::from_data(&output).to_string();

				create_dir_all(cache_path.with_file_name(""))?;

				let mut file = File::create(&cache_path)?;

				file.write_all(etag.as_bytes())?;
				file.write_all("\n".as_bytes())?;
				file.write_all(content_type.as_bytes())?;
				file.write_all("\n".as_bytes())?;
				file.write_all(&output)?;

				let etag_matches = etag_matches(&Some(etag), &req_headers);

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
