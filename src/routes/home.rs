use crate::{
	error, filters,
	models::{Post, Site},
	state,
};
use askama::Template;
use axum::{
	extract::State,
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use std::sync::Arc;

#[derive(Template)]
#[template(path = "home.html")]
struct View {
	site: Site,
	post_list: Vec<Post>,
}

pub async fn home_handler(
	State(state): State<Arc<state::State>>,
) -> Result<Response, error::Error> {
	let post_list = state.model.all_posts().await;
	let site = state.model.site().await?;
	let html = View { site, post_list }.render()?;

	Ok((StatusCode::OK, Html(html)).into_response())
}
