use crate::{error::AppError, models::page, routes::not_found::*, state::AppState};
use axum::{
	extract::{Path, State},
	http::header,
	response::{IntoResponse, Response},
};
use mime_guess::mime::TEXT_HTML_UTF_8;
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn page(
	State(app_state): State<Arc<AppState>>,
	Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
	let content_type = TEXT_HTML_UTF_8.to_string();
	let page_category = category;
	let page_slug = slug;

	let page: Option<page::Model> = page::Entity::find()
		.filter(
			Condition::all()
				.add(page::Column::Category.eq(&page_category))
				.add(page::Column::Slug.eq(page_slug)),
		)
		.order_by_desc(page::Column::Date)
		.one(&app_state.database)
		.await?;

	if let Some(page) = page {
		let html = app_state
			.templates
			.get_template(page.template.as_str())
			.and_then(|template| {
				template.render(context! {
					page => page,
				})
			})?;

		let body = html.as_bytes().to_vec();

		Ok(([(header::CONTENT_TYPE, content_type)], body).into_response())
	} else {
		not_found(State(app_state))
	}
}
