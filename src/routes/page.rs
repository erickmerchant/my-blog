use crate::{
	error::AppError,
	models::{cache, page},
	routes::not_found,
	state::AppState,
};
use axum::{
	extract::{Path, State},
	http::{header, Uri},
	response::{IntoResponse, Response},
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn page(
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
		let ctx = context! {
			site => &app_state.site,
			page => &page,
		};

		let html = app_state
			.templates
			.get_template(&page.template)
			.and_then(|template| template.render(ctx))?;

		let body = html.as_bytes().to_vec();

		let etag = cache::save(
			&app_state,
			uri.path().to_string(),
			content_type.to_string(),
			body.clone(),
		)
		.await;

		Ok((
			[(header::CONTENT_TYPE, content_type), (header::ETAG, etag)],
			body,
		)
			.into_response())
	} else {
		not_found(State(app_state))
	}
}
