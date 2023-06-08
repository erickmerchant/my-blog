use crate::{error::AppError, models::cache, models::page, state::AppState};
use axum::{
	extract::Path, extract::State, http::header, http::Uri, response::IntoResponse,
	response::Response,
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{sync::Arc, vec::Vec};

pub async fn rss(
	State(app_state): State<Arc<AppState>>,
	Path(category): Path<String>,
	uri: Uri,
) -> Result<Response, AppError> {
	let content_type = "application/rss+xml".to_string();
	let pages: Vec<page::Model> = page::Entity::find()
		.filter(page::Column::Category.eq(&category))
		.order_by_desc(page::Column::Date)
		.all(&app_state.database.clone())
		.await?;
	let ctx = context! {
		site => &app_state.site,
		pages => pages,
	};
	let rss = app_state
		.templates
		.get_template("layouts/rss.jinja")
		.and_then(|template| template.render(ctx))?;
	let body = rss.as_bytes().to_vec();
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
}
