use crate::{
	error::AppError,
	models::{entry, tag},
	state::AppState,
	views::entry::view,
};
use axum::{
	extract::State,
	http::{header, StatusCode, Uri},
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use mime_guess::mime::TEXT_HTML_UTF_8;
use sea_orm::{entity::prelude::*, query::*};
use std::{fs, sync::Arc};

pub async fn asset(State(app_state): State<Arc<AppState>>, uri: Uri) -> Result<Response, AppError> {
	let content_type = TEXT_HTML_UTF_8.to_string();
	let results = entry::Entity::find()
		.filter(Condition::all().add(entry::Column::Permalink.eq(uri.path())))
		.find_with_related(tag::Entity)
		.all(&app_state.database)
		.await?;

	if !results.is_empty() {
		view(app_state, results, None, content_type, false).await
	} else {
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
			Ok(StatusCode::NOT_FOUND.into_response())
		}
	}
}
