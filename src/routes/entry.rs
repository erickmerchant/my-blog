use crate::models::entry;
use axum::{
	extract::{Path, State},
	http::{header, StatusCode},
	response::{Html, IntoResponse, Response},
};
use minijinja::context;
use sea_orm::entity::prelude::*;
use std::sync::Arc;

pub async fn entry_handler(
	State(app_state): State<Arc<crate::State>>,
	Path(slug): Path<String>,
) -> Result<Response, crate::Error> {
	let results = entry::Entity::find()
		.filter(entry::Column::Slug.eq(slug))
		.all(&app_state.database)
		.await?;

	if let Some(entry) = results.first() {
		let html = app_state.templates.render(
			"entry.jinja".to_string(),
			Some(context! {
				entry,
			}),
		)?;
		let body = html.as_bytes().to_vec();

		return Ok((
			[(header::CONTENT_TYPE, "text/html; charset=utf-8".to_string())],
			body,
		)
			.into_response());
	}

	let body = app_state
		.templates
		.render("not-found.jinja".to_string(), None)?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
