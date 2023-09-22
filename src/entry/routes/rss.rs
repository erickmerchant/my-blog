use super::super::{
	models::{entry, tag},
	views::entry::entry_view,
};
use crate::{error::AppError, state::AppState};
use axum::{
	extract::{Path, State},
	response::Response,
};
use sea_orm::{entity::prelude::*, query::Condition};
use std::sync::Arc;

pub async fn rss_handler(
	State(app_state): State<Arc<AppState>>,
	Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
	let content_type = "application/rss+xml; charset=utf-8".to_string();
	let results = entry::Entity::find()
		.filter(
			Condition::all()
				.add(entry::Column::Slug.eq(slug))
				.add(entry::Column::Category.eq(category)),
		)
		.find_with_related(tag::Entity)
		.all(&app_state.database)
		.await?;

	entry_view(
		app_state,
		results.get(0),
		Some("layouts/rss.jinja".to_string()),
		content_type,
		false,
	)
	.await
}
