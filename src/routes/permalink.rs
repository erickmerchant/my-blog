use super::not_found::*;
use crate::{error::AppError, models::entry, state::AppState};
use axum::{
	extract::State,
	http::{header, Uri},
	response::{IntoResponse, Response},
};
use mime_guess::mime::TEXT_HTML_UTF_8;
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn permalink(
	State(app_state): State<Arc<AppState>>,
	uri: Uri,
) -> Result<Response, AppError> {
	let content_type = TEXT_HTML_UTF_8.to_string();
	let entry = entry::Entity::find()
		.filter(Condition::all().add(entry::Column::Permalink.eq(uri.path())))
		.one(&app_state.database)
		.await?;

	if let Some(mut entry) = entry {
		if let Some(mut query) = entry.query.clone() {
			query.run(&app_state.database).await?;

			entry.query = Some(query);
		}

		let html = app_state
			.templates
			.get_template(
				entry
					.template
					.clone()
					.unwrap_or("layouts/entry.jinja".to_string())
					.as_str(),
			)
			.and_then(|template| {
				template.render(context! {
					entry => entry,
				})
			})?;
		let body = html.as_bytes().to_vec();

		Ok(([(header::CONTENT_TYPE, content_type)], body).into_response())
	} else {
		not_found(State(app_state))
	}
}
