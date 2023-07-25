use super::{headers::*, rewrite_assets::*};
use crate::{error::AppError, models::cache, state::AppState};
use axum::{
	extract::State,
	http::{Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
};
use etag::EntityTag;
use hyper::{body::to_bytes, Body, HeaderMap};
use mime_guess::mime::TEXT_HTML_UTF_8;
use sea_orm::{entity::prelude::*, query::*, ActiveValue::Set};
use std::sync::Arc;

pub async fn handler<B>(
	State(app_state): State<Arc<AppState>>,
	req: Request<B>,
	next: Next<B>,
) -> Result<Response, AppError> {
	if app_state.args.no_cache {
		return Ok(next.run(req).await);
	}

	let uri = req.uri().to_string();
	let cache_result: Option<cache::Model> = cache::Entity::find()
		.filter(Condition::all().add(cache::Column::Path.eq(&uri)))
		.one(&app_state.database)
		.await?;

	if let Some(cache_result) = cache_result {
		let res_headers = HeaderMap::new();

		return if cache_result.content_type == TEXT_HTML_UTF_8.to_string() {
			let etag_matches = if let Some(etag) = &cache_result.etag {
				let etag = etag.parse::<EntityTag>().ok();
				let req_headers = req.headers().clone();

				Some(
					get_header(req_headers, "if-none-match".to_string())
						.and_then(|h| h.parse::<EntityTag>().ok())
						.is_some_and(|if_none_match| {
							etag.is_some_and(|etag| etag.weak_eq(&if_none_match))
						}),
				)
			} else {
				None
			};

			if etag_matches.is_some_and(|m| m) {
				Ok(StatusCode::NOT_MODIFIED.into_response())
			} else {
				Ok((
					add_cache_headers(res_headers, cache_result.content_type, cache_result.etag),
					cache_result.body,
				)
					.into_response())
			}
		} else {
			Ok((
				add_cache_headers(res_headers, cache_result.content_type, None),
				cache_result.body,
			)
				.into_response())
		};
	};

	let res = next.run(req).await;
	let (mut parts, body) = res.into_parts();
	let bytes = to_bytes(body).await;
	let mut output = vec![];

	if let Ok(bytes) = bytes {
		if let Some(content_type) = get_header(parts.headers.clone(), "content-type".to_string()) {
			let mut etag = None;

			if content_type == TEXT_HTML_UTF_8.to_string() {
				let etag_string = EntityTag::from_data(&bytes).to_string();

				etag = Some(etag_string.clone());
				output = rewrite_assets(bytes, output)?;
			} else {
				output = bytes.to_vec();
			};

			let cache_model = cache::ActiveModel {
				path: Set(uri),
				content_type: Set(content_type.clone()),
				etag: Set(etag.clone()),
				body: Set(output.clone()),
				..Default::default()
			};

			cache_model.insert(&app_state.database).await.ok();
			parts.headers = add_cache_headers(parts.headers, content_type, etag);
		} else {
			output = bytes.to_vec();
		};

		Ok(Response::from_parts(parts, Body::from(output)).into_response())
	} else {
		Ok(StatusCode::INTERNAL_SERVER_ERROR.into_response())
	}
}
