use crate::models::entry;
use axum::{
	extract::State,
	http::header,
	response::{IntoResponse, Response},
};
use minijinja::context;
use sea_orm::{
	entity::prelude::*,
	query::{Order, QueryOrder},
};
use std::sync::Arc;

pub async fn rss_handler(
	State(app_state): State<Arc<crate::State>>,
) -> Result<Response, crate::Error> {
	let entry_list = entry::Entity::find()
		.order_by(entry::Column::Date, Order::Desc)
		.all(&app_state.database)
		.await?;
	let html = app_state.templates.render(
		"rss.jinja".to_string(),
		Some(context! {
			entry_list,
		}),
	)?;
	let body = html.as_bytes().to_vec();

	Ok((
		[(
			header::CONTENT_TYPE,
			"application/rss+xml; charset=utf-8".to_string(),
		)],
		body,
	)
		.into_response())
}
