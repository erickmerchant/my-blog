use crate::{
	error::AppError, models::entry::*, state::AppState, views::entry::view, views::not_found,
};
use axum::{
	extract::{Path, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use mime_guess::mime::TEXT_HTML_UTF_8;
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn entry(
	State(app_state): State<Arc<AppState>>,
	Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
	let content_type = TEXT_HTML_UTF_8.to_string();
	let entry = Entity::find()
		.filter(
			Condition::all()
				.add(Column::Slug.eq(slug))
				.add(Column::Category.eq(category)),
		)
		.one(&app_state.database)
		.await?;

	if let Some(mut entry) = entry {
		if let Some(permalink) = entry.permalink {
			Ok((
				[(header::LOCATION, permalink)],
				StatusCode::MOVED_PERMANENTLY,
			)
				.into_response())
		} else {
			let template = entry
				.clone()
				.template
				.unwrap_or("layouts/entry.jinja".to_string());

			Ok(view(app_state, &mut entry, template, content_type).await?)
		}
	} else {
		not_found::view(app_state)
	}
}
