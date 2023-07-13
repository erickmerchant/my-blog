use crate::{error::AppError, models::page, routes::not_found, state::AppState, views::cacheable};
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
	let content_type = "text/html; charset=utf-8".to_string();

	let pages: Vec<page::Model> = page::Entity::find()
		.filter(page::Column::Category.eq(&category))
		.order_by_desc(page::Column::Date)
		.all(&app_state.database.clone())
		.await?;

	let pages_index_page: Option<page::Model> = page::Entity::find()
		.filter(
			Condition::all()
				.add(page::Column::Category.eq(""))
				.add(page::Column::Slug.eq(&category)),
		)
		.order_by_desc(page::Column::Date)
		.one(&app_state.database.clone())
		.await?;

	if !pages.is_empty() && pages_index_page.is_some() {
		cacheable::handler(
			app_state.as_ref().clone(),
			content_type.clone(),
			uri,
			pages_index_page
				.clone()
				.map_or("layouts/index.jinja".to_string(), |page| page.template),
			context! {
				site => &app_state.site,
				page => pages_index_page,
				pages => &pages,
			},
		)
		.await
	} else {
		not_found::handler(State(app_state))
	}
}
