use super::not_found;
use crate::{
	filters,
	models::{post, site, status::Status},
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
	pub site: site::Model,
	pub post: post::Model,
}

pub async fn handler(
	State(state): State<Arc<crate::State>>,
	Path(slug): Path<String>,
) -> Result<Response, crate::Error> {
	let post: Option<post::Model> = post::Model::by_slug(&state.base_dir, slug.to_string()).await;

	if let Some(post) = post {
		let site = site::Model::read(&state.base_dir).await?;
		let html = View { site, post }.render()?;

		return Ok((StatusCode::OK, Html(html)).into_response());
	}

	not_found::handler(State(state)).await
}
