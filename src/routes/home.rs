use crate::{
	filters,
	models::{post, site, status::Status},
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
	pub site: site::Entry,
	pub post_list: Vec<post::Entry>,
}

pub async fn handler(State(state): State<Arc<crate::State>>) -> Result<Response, crate::Error> {
	let post_model = post::Model {
		fs: state.content.clone(),
	};
	let site_model = site::Model {
		fs: state.content.clone(),
	};
	let post_list = post_model.all().await;
	let site = site_model.read().await?;
	let html = View { site, post_list }.render()?;

	Ok((StatusCode::OK, Html(html)).into_response())
}
