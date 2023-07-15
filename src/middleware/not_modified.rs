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
	if envmnt::is("APP_DEV") {
		Ok(next.run(req).await)
	} else {
		let req_headers = req.headers().clone();
		let uri = req.uri().to_string();

		let cache_result: Option<cache::Model> = cache::Entity::find()
			.filter(Condition::all().add(cache::Column::Path.eq(uri.clone())))
			.one(&app_state.database.clone())
			.await?;

		Ok(if let Some(cache_result) = cache_result {
			let etag = cache_result.etag.parse::<EntityTag>().ok();
			let etag_matches = req_headers
				.get("if-none-match")
				.and_then(|h| h.to_str().ok())
				.and_then(|h| h.parse::<EntityTag>().ok())
				.map(|if_none_match| {
					etag.map(|etag| etag.weak_eq(&if_none_match))
						.unwrap_or(false)
				})
				.unwrap_or(false);

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
			let bytes = to_bytes(body).await;

			if let Ok(bytes) = bytes {
				let etag = EntityTag::from_data(&bytes).to_string();

				parts.headers.insert(
					header::ETAG,
					HeaderValue::from_str(etag.as_str()).expect("should be valid etag"),
				);

				if let Some(content_type) = parts.headers.get("content-type") {
					let cache_model = cache::ActiveModel {
						path: Set(uri),
						content_type: Set(content_type
							.to_str()
							.map(|c| c.to_string())
							.expect("should be str")),
						etag: Set(etag),
						body: Set(bytes.to_vec()),
						..Default::default()
					};

					cache_model.clone().insert(&app_state.database).await.ok();
				};

				Response::from_parts(parts, Body::from(bytes)).into_response()
			} else {
				StatusCode::INTERNAL_SERVER_ERROR.into_response()
			}
		})
	}
}
