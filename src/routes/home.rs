use crate::{
	error, filters,
	models::{post, site},
	state,
};
use axum::{
	extract::State,
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use rinja::Template;
use std::sync::Arc;

#[derive(Template)]
#[template(path = "home.html")]
struct View {
	pub site: site::Model,
	pub post_list: Vec<post::Model>,
}

pub async fn handler(State(state): State<Arc<state::State>>) -> Result<Response, error::Error> {
	let post_list = post::Model::all(&state.base_dir).await;
	let site = site::Model::read(&state.base_dir).await?;
	let html = View { site, post_list }.render()?;

	Ok((StatusCode::OK, Html(html)).into_response())
}
