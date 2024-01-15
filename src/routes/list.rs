use crate::models::{entry, tag};
use axum::{
	extract::State,
	http::header,
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use minijinja::context;
use sea_orm::{
	entity::prelude::*,
	query::{Order, QueryOrder},
};
use std::sync::Arc;

pub async fn list_handler(
	State(app_state): State<Arc<crate::State>>,
) -> Result<Response, crate::Error> {
	let tagged_entry_list = entry::Entity::find()
		.order_by(entry::Column::Date, Order::Desc)
		.find_with_related(tag::Entity)
		.all(&app_state.database)
		.await?;

	let tagged_entry_list = tagged_entry_list
		.iter()
		.map(|(entry, tags)| entry::TaggedEntry {
			id: entry.id,
			slug: entry.slug.to_owned(),
			title: entry.title.to_owned(),
			date: entry.date.to_owned(),
			content: entry.content.to_owned(),
			tags: tags.to_owned(),
		})
		.collect::<Vec<_>>();

	if tagged_entry_list.is_empty() {
		let body = app_state
			.templates
			.render("not-found.jinja".to_string(), None)?;

		return Ok((StatusCode::NOT_FOUND, Html(body)).into_response());
	}

	let html = app_state.templates.render(
		"list.jinja".to_string(),
		Some(context! {
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
