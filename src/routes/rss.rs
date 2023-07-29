use crate::{error::AppError, models::post, state::AppState};
use axum::{
	extract::State,
	http::header,
	response::{IntoResponse, Response},
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{sync::Arc, vec::Vec};

pub async fn rss(State(app_state): State<Arc<AppState>>) -> Result<Response, AppError> {
	let content_type = "application/rss+xml; charset=utf-8".to_string();
	let posts: Vec<post::Model> = post::Entity::find()
		.order_by_desc(post::Column::Date)
		.all(&app_state.database)
		.await?;
	let html = app_state
		.templates
		.get_template("layouts/rss.jinja")
		.and_then(|template| {
			template.render(context! {
				posts => &posts,
			})
		})?;
	let body = html.as_bytes().to_vec();

	Ok(([(header::CONTENT_TYPE, content_type)], body).into_response())
}
