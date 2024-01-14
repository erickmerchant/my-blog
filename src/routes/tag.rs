use crate::models::entry;
use axum::{
	extract::{Path, State},
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

pub async fn tag_handler(
	State(app_state): State<Arc<crate::State>>,
	Path(tag): Path<String>,
) -> Result<Response, crate::Error> {
	let entry_list = entry::Entity::find()
		.filter(entry::Column::Tags.contains(tag.clone()))
		.order_by(entry::Column::Date, Order::Desc)
		.all(&app_state.database)
		.await?;

	if entry_list.is_empty() {
		let body = app_state
			.templates
			.render("not-found.jinja".to_string(), None)?;

		return Ok((StatusCode::NOT_FOUND, Html(body)).into_response());
	}

	let html = app_state.templates.render(
		"tag.jinja".to_string(),
		Some(context! {
			tag,
			entry_list,
		}),
	)?;
	let body = html.as_bytes().to_vec();

	Ok((
		[(header::CONTENT_TYPE, "text/html; charset=utf-8".to_string())],
		body,
	)
		.into_response())
}
