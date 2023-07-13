use crate::{error::AppError, models::page, routes::not_found, state::AppState, views::cacheable};
use axum::{
	extract::{Path, State},
	http::Uri,
	response::Response,
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn route(
	State(app_state): State<Arc<AppState>>,
	Path((category, slug)): Path<(String, String)>,
	uri: Uri,
) -> Result<Response, AppError> {
	let content_type = "text/html; charset=utf-8".to_string();
	let page_category = category.clone();
	let page_slug = slug.clone();

	let page: Option<page::Model> = page::Entity::find()
		.filter(
			Condition::all()
				.add(page::Column::Category.eq(&page_category))
				.add(page::Column::Slug.eq(page_slug)),
		)
		.order_by_desc(page::Column::Date)
		.one(&app_state.database.clone())
		.await?;

	if let Some(page) = page {
		cacheable::view(
			app_state.as_ref().clone(),
			content_type.clone(),
			uri,
			page.template.clone(),
			context! {
				site => &app_state.site,
				page => page,
			},
		)
		.await
	} else {
		not_found::route(State(app_state))
	}
}
