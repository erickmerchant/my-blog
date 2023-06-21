use crate::{error::AppError, models::cache, models::page, routes::not_found, state::AppState};
use axum::{
	extract::Path, extract::State, http::header, http::Uri, response::IntoResponse,
	response::Response,
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{sync::Arc, vec::Vec};

pub async fn index(
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

	match !pages.is_empty() && pages_index_page.is_some() {
		true => {
			let ctx = context! {
				site => &app_state.site,
				page => &pages_index_page,
				pages => &pages,
			};

			let html = app_state
				.templates
				.get_template(
					pages_index_page
						.map_or("layouts/index.jinja".to_string(), |page| page.template)
						.as_str(),
				)
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
		}
		false => not_found(State(app_state)),
	}
}
