use crate::{error::AppError, models::page, routes::not_found::*, state::AppState};
use axum::{
	extract::{Path, State},
	http::header,
	response::{IntoResponse, Response},
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{sync::Arc, vec::Vec};

pub async fn index(
	State(app_state): State<Arc<AppState>>,
	Path(category): Path<String>,
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
		let html = app_state
			.templates
			.get_template("layouts/index.jinja")
			.and_then(|template| {
				template.render(context! {
					site => &app_state.site,
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
