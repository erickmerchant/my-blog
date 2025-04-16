pub(super) mod import_map;
pub(super) mod paths;
pub(super) mod rewriter;

use crate::{error, state};
use axum::{
	body::{to_bytes, Body},
	extract::State,
	http::{header, Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use etag::EntityTag;
use rewriter::Rewriter;
use std::{fs, sync::Arc};
use url::Url;

pub async fn html_layer(
	State(state): State<Arc<state::State>>,
	req: Request<Body>,
	next: Next,
) -> Result<Response, error::Error> {
	let headers = &req.headers().clone();
	let uri = req.uri().clone();
	let mut path = uri.path().to_string();

	if uri.path().ends_with("/") {
		path += "index.html";
	}

	let cache_path =
		Utf8Path::new(&state.args.base_dir).join("storage/cache/".to_string() + path.as_str());
	let body = fs::read(&cache_path).ok();
	let if_none_match = headers.get(header::IF_NONE_MATCH);
	let body = if let Some(body) = body {
		body
	} else {
		let res = next.run(req).await;

		if res.status() != StatusCode::OK {
			return Ok(res);
		}

		let body = res.into_body();
		let body = to_bytes(body, usize::MAX).await?;
		let rewriter = Rewriter {
			url: Url::parse("https://0.0.0.0")?.join(path.as_str())?,
			base_dir: state.args.base_dir.to_owned(),
		};
		let body = if state.args.rewrite_assets {
			rewriter.rewrite(&body)?
		} else {
			body.to_vec()
		};

		if let Some(dir) = cache_path.parent() {
			fs::create_dir_all(dir).ok();
		}

		fs::write(cache_path, &body).ok();

		body
	};
	let etag = EntityTag::from_data(&body).to_string();

	if if_none_match.is_some_and(|if_none_match| etag == *if_none_match) {
		return Ok(StatusCode::NOT_MODIFIED.into_response());
	}

	Ok((
		StatusCode::OK,
		[
			(header::CONTENT_TYPE, mime::TEXT_HTML.to_string()),
			(header::ETAG, etag),
		],
		body,
	)
		.into_response())
}
