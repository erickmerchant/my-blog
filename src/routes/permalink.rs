use crate::{
	error::AppError, models::entry::*, state::AppState, views::entry::view, views::not_found,
};
use axum::{extract::State, http::Uri, response::Response};
use mime_guess::mime::TEXT_HTML_UTF_8;
use sea_orm::entity::prelude::*;
use std::sync::Arc;

pub async fn permalink(
	State(app_state): State<Arc<AppState>>,
	uri: Uri,
) -> Result<Response, AppError> {
	let content_type = TEXT_HTML_UTF_8.to_string();
	let entry = Entity::find()
		.filter(Column::Permalink.eq(uri.path()))
		.one(&app_state.database)
		.await?;

	if let Some(mut entry) = entry {
		let template = entry
			.clone()
			.template
			.unwrap_or("layouts/entry.jinja".to_string());

		Ok(view(app_state, &mut entry, template, content_type).await?)
	} else {
		not_found::view(app_state)
	}
}
