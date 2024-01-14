use crate::models::entry;
use axum::{
	extract::{Query, State},
	http::header,
	response::{IntoResponse, Response},
};
use minijinja::context;
use sea_orm::{
	entity::prelude::*,
	query::{Order, QueryOrder},
};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct Params {
	tag: Option<String>,
}

pub async fn list_handler(
	State(app_state): State<Arc<crate::State>>,
	Query(params): Query<Params>,
) -> Result<Response, crate::Error> {
	let entry_list = entry::Entity::find();

	let entry_list = if let Some(tag) = params.tag.clone() {
		entry_list.filter(entry::Column::Tags.contains(tag))
	} else {
		entry_list
	};

	let entry_list = entry_list
		.order_by(entry::Column::Date, Order::Desc)
		.all(&app_state.database)
		.await?;
	let html = app_state.templates.render(
		"list.jinja".to_string(),
		Some(context! {
			tag => params.tag,
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
