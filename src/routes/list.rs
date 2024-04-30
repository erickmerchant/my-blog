use super::not_found::not_found_handler;
use crate::{
	filters,
	models::{entry, site},
};
use askama::Template;
use axum::{
	http::header,
	response::{IntoResponse, Response},
};

#[derive(Template)]
#[template(path = "list.html")]
struct View {
	pub site: site::Model,
	pub entry_list: Vec<entry::Model>,
}

pub async fn list_handler() -> Result<Response, crate::Error> {
	let entry_list: Vec<entry::Model> = entry::Model::find_all_frontmatter();

	if entry_list.is_empty() {
		return not_found_handler().await;
	}

	let site = site::Model::load()?;
	let html = View { site, entry_list }.render()?;

	Ok(([(header::CONTENT_TYPE, "text/html; charset=utf-8")], html).into_response())
}
