use crate::{error::AppError, models::cache, state::AppState};
use axum::{
	http::{Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
	{extract::State, http::header},
};
use etag::EntityTag;
use hyper::{body::to_bytes, header::HeaderValue, Body};
use sea_orm::{entity::prelude::*, query::*, ActiveValue::Set};

pub async fn not_modified<B>(
	State(app_state): State<AppState>,
	req: Request<B>,
	next: Next<B>,
) -> Result<Response, AppError> {
	let req_headers = req.headers().clone();
	let uri = req.uri().to_string();
	let mut if_none_match: Option<EntityTag> = None;

	if let Some(header) = req_headers
		.get("if-none-match")
		.and_then(|h| h.to_str().ok())
	{
		if_none_match = header.parse::<EntityTag>().ok();
	};

	let mut etag_matches = false;
	let cache_result: Option<cache::Model> = if envmnt::is("APP_DEV") {
		None
	} else {
		cache::Entity::find()
			.filter(Condition::all().add(cache::Column::Path.eq(uri.clone())))
			.one(&app_state.database.clone())
			.await?
	};

	let result = if let Some(cache_result) = cache_result {
		let etag = cache_result.etag.parse::<EntityTag>().ok();

		if let (Some(etag), Some(if_none_match)) = (etag, if_none_match) {
			if etag.weak_eq(&if_none_match) {
				etag_matches = true
			}
		}

		if etag_matches {
			StatusCode::NOT_MODIFIED.into_response()
		} else {
			(
				[
					(header::CONTENT_TYPE, cache_result.content_type),
					(header::ETAG, cache_result.etag),
				],
				cache_result.body,
			)
				.into_response()
		}
	} else {
		let res = next.run(req).await;

		let (mut parts, body) = res.into_parts();

		match to_bytes(body).await {
			Ok(bytes) => {
				let etag = EntityTag::from_data(&bytes).to_string();

				parts.headers.insert(
					header::ETAG,
					HeaderValue::from_str(etag.as_str()).expect("should be valid etag"),
				);

				if let Some(content_type) = parts.headers.get("content-type") {
					if !envmnt::is("APP_DEV") {
						let cache_model = cache::ActiveModel {
							path: Set(uri),
							content_type: Set(content_type
								.to_str()
								.expect("should be str")
								.to_string()),
							etag: Set(etag),
							body: Set(bytes.to_vec()),
							..Default::default()
						};

						cache_model.clone().insert(&app_state.database).await.ok();
					};
				};

				Response::from_parts(parts, Body::from(bytes)).into_response()
			}
			Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
		}
	};

	Ok(result)
}
