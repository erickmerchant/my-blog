use super::not_found::not_found_handler;
use crate::models::{entry, tag, TaggedEntry};
use axum::{
	extract::{Path, State},
	http::header,
	response::{IntoResponse, Response},
};
use minijinja::context;
use sea_orm::entity::prelude::*;
use std::sync::Arc;

pub async fn entry_handler(
	State(app_state): State<Arc<crate::State>>,
	Path(slug): Path<String>,
) -> Result<Response, crate::Error> {
	let tagged_entry_list = entry::Entity::find()
		.filter(entry::Column::Slug.eq(slug))
		.find_with_related(tag::Entity)
		.all(&app_state.database)
		.await?
		.into_iter()
		.map(TaggedEntry::from)
		.collect::<Vec<_>>();
	let tagged_entry = tagged_entry_list.first();

	if tagged_entry.is_none() {
		return not_found_handler(State(app_state)).await;
	}

	let html = app_state.templates.render(
		"entry.jinja".to_string(),
		Some(context! {
			tagged_entry,
		}),
	)?;
	let body = html.as_bytes().to_vec();

	Ok((
		[(header::CONTENT_TYPE, "text/html; charset=utf-8".to_string())],
		body,
	)
		.into_response())
}
