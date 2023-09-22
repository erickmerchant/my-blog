use super::super::{
	models::{entry, tag},
	views::{entry::entry_view, not_found::not_found_view},
};
use crate::{error::AppError, state::AppState};
use axum::{
	extract::State,
	http::{header, StatusCode, Uri},
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use sea_orm::{entity::prelude::*, query::Condition};
use std::{fs, sync::Arc};

pub async fn fallback_handler(
	State(app_state): State<Arc<AppState>>,
	uri: Uri,
) -> Result<Response, AppError> {
	let content_type = "text/html; charset=utf-8".to_string();
	let results = entry::Entity::find()
		.filter(Condition::all().add(entry::Column::Permalink.eq(uri.path())))
		.find_with_related(tag::Entity)
		.all(&app_state.database)
		.await?;

	if !results.is_empty() {
		return entry_view(app_state, results.get(0), None, content_type, false).await;
	}

	let uri = Utf8Path::new("theme").join(uri.path().trim_start_matches('/'));

	if let Some(ext) = uri.extension() {
		let uri = uri.with_extension("").with_extension(ext);
		let asset = mime_guess::from_ext(ext)
			.first()
			.map(|content_type| (content_type, fs::read(uri)));

		if let Some((content_type, Ok(body))) = asset {
			Ok(([(header::CONTENT_TYPE, content_type.to_string())], body).into_response())
		} else {
			Ok(StatusCode::NOT_FOUND.into_response())
		}
	} else {
		not_found_view(app_state)
	}
}
