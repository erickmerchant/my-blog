use crate::models::{post, site};
use axum::{
	extract::State,
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use rinja::Template;
use std::sync::Arc;

#[derive(Template)]
#[template(path = "rss.xml")]
pub struct View {
	pub site: site::Model,
	pub post_list: Vec<post::Model>,
}

pub async fn handler(State(state): State<Arc<crate::State>>) -> Result<Response, crate::Error> {
	let post_list = post::Model::all(&state.base_dir).await;
	let site = site::Model::read(&state.base_dir).await?;
	let html = View { site, post_list }.render()?;

	Ok((
		StatusCode::OK,
		[(header::CONTENT_TYPE, "application/rss+xml")],
		html,
	)
		.into_response())
}
