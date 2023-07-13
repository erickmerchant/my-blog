use crate::{error::AppError, models::page, state::AppState, views::cacheable};
use axum::{
	extract::{Path, State},
	http::Uri,
	response::Response,
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{sync::Arc, vec::Vec};

pub async fn handler(
	State(app_state): State<Arc<AppState>>,
	Path(category): Path<String>,
	uri: Uri,
) -> Result<Response, AppError> {
	let content_type = "application/rss+xml; charset=utf-8".to_string();

	let pages: Vec<page::Model> = page::Entity::find()
		.filter(page::Column::Category.eq(&category))
		.order_by_desc(page::Column::Date)
		.all(&app_state.database.clone())
		.await?;

	cacheable::handler(
		app_state.as_ref().clone(),
		content_type.clone(),
		uri,
		"layouts/rss.jinja".to_string(),
		context! {
			site => &app_state.site,
			pages => &pages,
		},
	)
	.await
}
