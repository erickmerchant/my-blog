use crate::{error::AppError, models::cache, state::AppState};
use axum::{
	http::{header, Uri},
	response::{IntoResponse, Response},
};
use etag::EntityTag;
use minijinja::value::Value;
use sea_orm::{entity::prelude::*, ActiveValue::Set};

pub async fn view(
	app_state: AppState,
	content_type: String,
	uri: Uri,
	template_path: String,
	context: Value,
) -> Result<Response, AppError> {
	let html = app_state
		.templates
		.get_template(template_path.as_str())
		.and_then(|template| template.render(context))?;

	let body = html.as_bytes().to_vec();

	let etag = EntityTag::from_data(&body).to_string();

	if !envmnt::is("APP_DEV") {
		let cache_model = cache::ActiveModel {
			path: Set(uri.path().to_string()),
			content_type: Set(content_type.clone()),
			etag: Set(etag.clone()),
			body: Set(body.clone()),
			..Default::default()
		};

		cache_model.clone().insert(&app_state.database).await.ok();
	};

	Ok((
		[(header::CONTENT_TYPE, content_type), (header::ETAG, etag)],
		body,
	)
		.into_response())
}
