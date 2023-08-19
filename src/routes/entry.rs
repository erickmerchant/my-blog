use crate::{
	error::AppError,
	models::{entry, tag},
	state::AppState,
	views::entry::*,
};
use axum::{
	extract::{Path, State},
	response::Response,
};
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn entry_handler(
	State(app_state): State<Arc<AppState>>,
	Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
	let content_type = "text/html; charset=utf-8".to_string();
	let results = entry::Entity::find()
		.filter(
			Condition::all()
				.add(entry::Column::Slug.eq(slug))
				.add(entry::Column::Category.eq(category)),
		)
		.find_with_related(tag::Entity)
		.all(&app_state.database)
		.await?;

	entry_view(app_state, results, None, content_type, true).await
}
