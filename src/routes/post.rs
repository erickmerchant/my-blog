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
	pub site: site::Entry,
	pub post: post::Entry,
}

pub async fn handler(
	State(state): State<Arc<crate::State>>,
	Path(slug): Path<String>,
) -> Result<Response, crate::Error> {
	let post_model = post::Model {
		fs: state.content.clone(),
	};
	let post: Option<post::Entry> = post_model.by_slug(&slug).await;

	if let Some(post) = post {
		let site_model = site::Model {
			fs: state.content.clone(),
		};
		let site = site_model.read().await?;
		let html = View { site, post }.render()?;

		return Ok((StatusCode::OK, Html(html)).into_response());
	}

	not_found::handler(State(state)).await
}
