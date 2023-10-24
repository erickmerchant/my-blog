use crate::{
	models::{entry, tag},
	views::{entry::entry_view, not_found::not_found_view},
};
use axum::{extract::State, http::Uri, response::Response};

use sea_orm::{entity::prelude::*, query::Condition};
use std::sync::Arc;

pub async fn permalink_handler(
	State(app_state): State<Arc<crate::State>>,
	uri: Uri,
) -> Result<Response, crate::Error> {
	let content_type = "text/html; charset=utf-8".to_string();
	let results = entry::Entity::find()
		.filter(Condition::all().add(entry::Column::Permalink.eq(uri.path())))
		.find_with_related(tag::Entity)
		.all(&app_state.database)
		.await?;

	if !results.is_empty() {
		entry_view(app_state, results.get(0), None, content_type, false).await
	} else {
		not_found_view(app_state).await
	}
}
