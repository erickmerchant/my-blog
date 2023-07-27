use super::not_found::*;
use crate::{error::AppError, models::page, state::AppState};
use axum::{
	extract::{Path, State},
	http::header,
	response::{IntoResponse, Response},
};
use mime_guess::mime::TEXT_HTML_UTF_8;
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{sync::Arc, vec::Vec};
use tokio::try_join;

pub async fn category(
	State(app_state): State<Arc<AppState>>,
	Path(category): Path<String>,
) -> Result<Response, AppError> {
	let content_type = TEXT_HTML_UTF_8.to_string();

	let (pages, pages_index_page): (Vec<page::Model>, Option<page::Model>) = try_join!(
		page::Entity::find()
			.filter(page::Column::Category.eq(&category))
			.order_by_desc(page::Column::Date)
			.all(&app_state.database),
		page::Entity::find()
			.filter(
				Condition::all()
					.add(page::Column::Category.eq(""))
					.add(page::Column::Slug.eq(&category)),
			)
			.order_by_desc(page::Column::Date)
			.one(&app_state.database)
	)?;

	if !pages.is_empty() && pages_index_page.is_some() {
		let html = app_state
			.templates
			.get_template("layouts/index.jinja")
			.and_then(|template| {
				template.render(context! {
					page => pages_index_page,
					pages => &pages,
				})
			})?;

		let body = html.as_bytes().to_vec();

		Ok(([(header::CONTENT_TYPE, content_type)], body).into_response())
	} else {
		not_found(State(app_state))
	}
}
