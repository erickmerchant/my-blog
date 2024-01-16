use super::not_found::not_found_handler;
use crate::models::{entry, tag};
use axum::{
	extract::{Path, State},
	http::header,
	response::{IntoResponse, Response},
};
use minijinja::context;
use sea_orm::{
	entity::prelude::*,
	query::{Order, QueryOrder},
};
use std::sync::Arc;

pub async fn tag_handler(
	State(app_state): State<Arc<crate::State>>,
	Path(tag): Path<String>,
) -> Result<Response, crate::Error> {
	let tagged_entry_list = entry::Entity::find()
		.order_by(entry::Column::Date, Order::Desc)
		.find_with_related(tag::Entity)
		.filter(tag::Column::Slug.eq(tag.clone()))
		.all(&app_state.database)
		.await?
		.into_iter()
		.map(entry::TaggedEntry::from)
		.collect::<Vec<_>>();

	if tagged_entry_list.is_empty() {
		return not_found_handler(State(app_state)).await;
	}

	let html = app_state.templates.render(
		"tag.jinja".to_string(),
		Some(context! {
			tag,
			tagged_entry_list,
		}),
	)?;
	let body = html.as_bytes().to_vec();

	Ok((
		[(header::CONTENT_TYPE, "text/html; charset=utf-8".to_string())],
		body,
	)
		.into_response())
}
