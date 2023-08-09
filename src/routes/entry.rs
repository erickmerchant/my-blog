use super::not_found::*;
use crate::{error::AppError, models::entry, state::AppState};
use axum::{
	extract::{Path, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use mime_guess::mime::TEXT_HTML_UTF_8;
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn entry(
	State(app_state): State<Arc<AppState>>,
	Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
	let content_type = TEXT_HTML_UTF_8.to_string();
	let entry = entry::Entity::find()
		.filter(
			Condition::all()
				.add(entry::Column::Slug.eq(slug))
				.add(entry::Column::Category.eq(category)),
		)
		.one(&app_state.database)
		.await?;

	if let Some(entry) = entry {
		if let Some(permalink) = entry.permalink {
			Ok((
				[(header::LOCATION, permalink)],
				StatusCode::MOVED_PERMANENTLY,
			)
				.into_response())
		} else {
			let html = app_state
				.templates
				.get_template(
					entry
						.to_owned()
						.template
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
		}
	} else {
		not_found(State(app_state))
	}
}
