use super::not_found;
use crate::{
	error, filters,
	models::{Post, Site},
	state,
};
use axum::{
	extract::{Path, State},
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use rinja::Template;
use std::sync::Arc;

#[derive(Template)]
#[template(path = "post.html")]
struct View {
	pub site: Site,
	pub post: Post,
}

pub async fn post_handler(
	State(state): State<Arc<state::State>>,
	Path(slug): Path<String>,
) -> Result<Response, error::Error> {
	let post: Option<Post> = state.model.post_by_slug(&slug).await;

	if let Some(post) = post {
		let site = state.model.site().await?;
		let html = View { site, post }.render()?;

		return Ok((StatusCode::OK, Html(html)).into_response());
	}

	not_found::not_found_handler(State(state)).await
}
