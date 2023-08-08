use super::not_found::*;
use crate::{error::AppError, models::entry, state::AppState};
use axum::{
	extract::State,
	http::header,
	response::{IntoResponse, Response},
};
use mime_guess::mime::TEXT_HTML_UTF_8;
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;
use tokio::try_join;

pub async fn index(State(app_state): State<Arc<AppState>>) -> Result<Response, AppError> {
	let content_type = TEXT_HTML_UTF_8.to_string();
	let (posts, index_page) = try_join!(
		entry::Entity::find()
			.filter(
				Condition::all()
					.add(entry::Column::Date.is_not_null())
					.add(entry::Column::Category.eq("posts"))
			)
			.order_by_desc(entry::Column::Date)
			.all(&app_state.database),
		entry::Entity::find()
			.filter(
				Condition::all()
					.add(entry::Column::Slug.eq("index"))
					.add(entry::Column::Category.eq("pages"))
			)
			.one(&app_state.database)
	)?;

	if !posts.is_empty() && index_page.is_some() {
		let html = app_state
			.templates
			.get_template("layouts/index.jinja")
			.and_then(|template| {
				template.render(context! {
					page => index_page,
					posts => &posts,
				})
			})?;
		let body = html.as_bytes().to_vec();

		Ok(([(header::CONTENT_TYPE, content_type)], body).into_response())
	} else {
		not_found(State(app_state))
	}
}
