use crate::{error::AppError, models::entry, state::AppState};
use axum::{
	extract::{Path, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn rss(
	State(app_state): State<Arc<AppState>>,
	Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
	let content_type = "application/rss+xml; charset=utf-8".to_string();

	let entry = entry::Entity::find()
		.filter(
			Condition::all()
				.add(entry::Column::Slug.eq(slug))
				.add(entry::Column::Category.eq(category)),
		)
		.one(&app_state.database)
		.await?;

	if let Some(mut entry) = entry {
		if let Some(mut query) = entry.query.clone() {
			query.run(&app_state.database).await?;

			entry.query = Some(query);
		}

		let html = app_state
			.templates
			.get_template("layouts/rss.jinja")
			.and_then(|template| {
				template.render(context! {
					entry => &entry,
				})
			})?;
		let body = html.as_bytes().to_vec();

		Ok(([(header::CONTENT_TYPE, content_type)], body).into_response())
	} else {
		Ok(StatusCode::NOT_FOUND.into_response())
	}
}
