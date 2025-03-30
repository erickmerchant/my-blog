use crate::{
	error,
	models::{Post, Site},
	state,
};
use askama::Template;
use axum::{
	extract::State,
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use std::sync::Arc;

#[derive(Template)]
#[template(path = "rss.xml")]
pub struct View {
	pub site: Site,
	pub post_list: Vec<Post>,
}

pub async fn rss_handler(State(state): State<Arc<state::State>>) -> Result<Response, error::Error> {
	let post_list = state.model.all_posts().await;
	let site = state.model.site().await?;
	let html = View { site, post_list }.render()?;

	Ok((
		StatusCode::OK,
		[(header::CONTENT_TYPE, "application/rss+xml")],
		html,
	)
		.into_response())
}
