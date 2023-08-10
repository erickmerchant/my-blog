use crate::{error::AppError, models::entry, state::AppState, views::entry::view};
use axum::{
	extract::{Path, State},
	http::StatusCode,
	response::{IntoResponse, Response},
};
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn rss(
	State(app_state): State<Arc<AppState>>,
	Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
	let content_type = "application/rss+xml; charset=utf-8".to_string();

	let entry = entry::Entity::find()
		.filter(
			Condition::all()
				.add(entry::Column::Slug.eq(slug))
				.add(entry::Column::Category.eq(category)),
		)
		.one(&app_state.database)
		.await?;

	if let Some(mut entry) = entry {
		Ok(view(
			app_state,
			&mut entry,
			"layouts/rss.jinja".to_string(),
			content_type,
		)
		.await?)
	} else {
		Ok(StatusCode::NOT_FOUND.into_response())
	}
}
