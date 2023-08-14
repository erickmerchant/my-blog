use crate::{error::AppError, models::entry, state::AppState, views::entry::view};
use axum::{
	extract::{Path, State},
	response::Response,
};
use mime_guess::mime::TEXT_HTML_UTF_8;
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn entry(
	State(app_state): State<Arc<AppState>>,
	Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
	let content_type = TEXT_HTML_UTF_8.to_string();

	view(
		app_state,
		Condition::all()
			.add(entry::Column::Slug.eq(slug))
			.add(entry::Column::Category.eq(category)),
		None,
		content_type,
		true,
	)
	.await
}
