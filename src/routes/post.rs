use super::not_found::*;
use crate::{error::AppError, models::post, state::AppState};
use axum::{
	extract::{Path, State},
	http::header,
	response::{IntoResponse, Response},
};
use mime_guess::mime::TEXT_HTML_UTF_8;
use minijinja::context;
use sea_orm::entity::prelude::*;
use std::sync::Arc;

pub async fn post(
	State(app_state): State<Arc<AppState>>,
	Path(slug): Path<String>,
) -> Result<Response, AppError> {
	let content_type = TEXT_HTML_UTF_8.to_string();
	let post: Option<post::Model> = post::Entity::find()
		.filter(post::Column::Slug.eq(slug))
		.one(&app_state.database)
		.await?;

	if let Some(post) = post {
		let html = app_state
			.templates
			.get_template("layouts/post.jinja")
			.and_then(|template| {
				template.render(context! {
					post => post,
				})
			})?;
		let body = html.as_bytes().to_vec();

		Ok(([(header::CONTENT_TYPE, content_type)], body).into_response())
	} else {
		not_found(State(app_state))
	}
}
