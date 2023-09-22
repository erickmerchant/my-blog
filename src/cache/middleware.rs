use super::{
	assets::rewrite_assets,
	headers::{add_cache_headers, etag_matches, get_header},
	model,
};
use crate::{error::AppError, state::AppState};
use axum::{
	extract::State,
	http::{Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
};
use etag::EntityTag;
use hyper::{body::to_bytes, Body, HeaderMap};
use sea_orm::{entity::prelude::*, ActiveValue::Set};
use std::sync::Arc;

pub const ETAGABLE_TYPES: &[&str] = &[
	"text/html; charset=utf-8",
	"application/rss+xml; charset=utf-8",
];

pub async fn cache_layer<B>(
	State(app_state): State<Arc<AppState>>,
	req: Request<B>,
	next: Next<B>,
) -> Result<Response, AppError> {
	let uri = req.uri().to_string();
	let cache_result = model::Entity::find()
		.filter(model::Column::Path.eq(&uri))
		.one(&app_state.database)
		.await?;
	let req_headers = req.headers().clone();

	if let Some(cache_result) = cache_result {
		let etag_matches = etag_matches(cache_result.etag.clone(), req_headers);

		if etag_matches {
			return Ok(StatusCode::NOT_MODIFIED.into_response());
		}

		return Ok((
			add_cache_headers(
				HeaderMap::new(),
				cache_result.content_type,
				cache_result.etag,
			),
			cache_result.body,
		)
			.into_response());
	}

	let res = next.run(req).await;

	if res.status() == StatusCode::OK {
		let (mut parts, body) = res.into_parts();
		let bytes = to_bytes(body).await?;
		let mut output = Vec::new();

		if let Some(content_type) = get_header(parts.headers.clone(), "content-type".to_string()) {
			let mut etag = None;

			if ETAGABLE_TYPES.contains(&content_type.as_str()) {
				output = rewrite_assets(bytes.to_owned(), output.to_owned())?;

				let etag_string = EntityTag::from_data(&output).to_string();

				etag = Some(etag_string.clone());
			} else {
				output = bytes.to_vec();
			};

			let cache_model = model::ActiveModel {
				path: Set(uri),
				content_type: Set(content_type.clone()),
				etag: Set(etag.clone()),
				body: Set(output.clone()),
				..Default::default()
			};

			cache_model.insert(&app_state.database).await.ok();

			let etag_matches = etag_matches(etag.clone(), req_headers);

			if etag_matches {
				return Ok(StatusCode::NOT_MODIFIED.into_response());
			}

			parts.headers = add_cache_headers(parts.headers.clone(), content_type, etag);
		} else {
			output = bytes.to_vec();
		};

		return Ok(Response::from_parts(parts, Body::from(output)).into_response());
	}

	Ok(res)
}
