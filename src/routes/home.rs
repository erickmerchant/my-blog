use crate::{
	filters,
	models::{entry, site, state::State},
};
use askama::Template;
use axum::{
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};

#[derive(Template)]
#[template(path = "home.html")]
struct View {
	pub site: site::Model,
	pub entry_list: Vec<entry::Model>,
}

pub async fn handler() -> Result<Response, crate::Error> {
	let entry_list = entry::Model::load_all(false).await;
	let site = site::Model::load().await?;
	let html = View { site, entry_list }.render()?;

	Ok((StatusCode::OK, Html(html)).into_response())
}
