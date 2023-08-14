use crate::{error::AppError, models::entry, state::AppState, views::entry::view};
use axum::{
	extract::{Path, State},
	response::Response,
};
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn rss(
	State(app_state): State<Arc<AppState>>,
	Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
	let content_type = "application/rss+xml; charset=utf-8".to_string();

	view(
		app_state,
		Condition::all()
			.add(entry::Column::Slug.eq(slug))
			.add(entry::Column::Category.eq(category)),
		Some("layouts/rss.jinja".to_string()),
		content_type,
		false,
	)
	.await
}
