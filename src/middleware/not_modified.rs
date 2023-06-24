use crate::{error::AppError, models::cache, state::AppState};
use axum::{
	extract::State, http::header, http::Request, http::StatusCode, middleware::Next,
	response::IntoResponse, response::Response,
};
use etag::EntityTag;
use sea_orm::{entity::prelude::*, query::*};

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
		next.run(req).await
	};

	Ok(result)
}
