use super::not_found::*;
use crate::{error::AppError, models::entry, state::AppState};
use axum::{
	extract::{Path, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use mime_guess::mime::TEXT_HTML_UTF_8;
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn page(
	State(app_state): State<Arc<AppState>>,
	Path(slug): Path<String>,
) -> Result<Response, AppError> {
	let content_type = TEXT_HTML_UTF_8.to_string();
	let page = entry::Entity::find()
		.filter(
			Condition::all()
				.add(entry::Column::Slug.eq(slug))
				.add(entry::Column::Category.eq("pages")),
		)
		.one(&app_state.database)
		.await?;

	if let Some(page) = page {
		if let Some(redirect) = page.redirect {
			Ok((
				[(header::LOCATION, redirect)],
				StatusCode::MOVED_PERMANENTLY,
			)
				.into_response())
		} else {
			let html = app_state
				.templates
				.get_template("layouts/page.jinja")
				.and_then(|template| {
					template.render(context! {
						page => page,
					})
				})?;
			let body = html.as_bytes().to_vec();

			Ok(([(header::CONTENT_TYPE, content_type)], body).into_response())
		}
	} else {
		not_found(State(app_state))
	}
}
