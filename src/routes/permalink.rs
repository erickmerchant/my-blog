use crate::{error::AppError, models::entry, state::AppState, views::entry::view};
use axum::{extract::State, http::Uri, response::Response};
use mime_guess::mime::TEXT_HTML_UTF_8;
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn permalink(
	State(app_state): State<Arc<AppState>>,
	uri: Uri,
) -> Result<Response, AppError> {
	let content_type = TEXT_HTML_UTF_8.to_string();

	view(
		app_state,
		Condition::all().add(entry::Column::Permalink.eq(uri.path())),
		None,
		content_type,
		false,
	)
	.await
}
