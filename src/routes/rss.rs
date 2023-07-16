use crate::{error::AppError, models::page, state::AppState};
use axum::{
	extract::{Path, State},
	http::header,
	response::{IntoResponse, Response},
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{sync::Arc, vec::Vec};

pub async fn rss(
	State(app_state): State<Arc<AppState>>,
	Path(category): Path<String>,
) -> Result<Response, AppError> {
	let content_type = "application/rss+xml; charset=utf-8".to_string();

	let pages: Vec<page::Model> = page::Entity::find()
		.filter(page::Column::Category.eq(&category))
		.order_by_desc(page::Column::Date)
		.all(&app_state.database.clone())
		.await?;

	let html = app_state
		.templates
		.get_template("layouts/rss.jinja")
		.and_then(|template| {
			template.render(context! {
				pages => &pages,
			})
		})?;

	let body = html.as_bytes().to_vec();

	Ok(([(header::CONTENT_TYPE, content_type)], body).into_response())
}
