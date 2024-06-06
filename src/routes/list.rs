use super::not_found;
use crate::{
	filters,
	models::{entry, site},
};
use askama::Template;
use axum::{
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};

#[derive(Template)]
#[template(path = "list.html")]
struct View {
	pub site: site::Model,
	pub entry_list: entry::ModelList,
}

pub async fn handler() -> Result<Response, crate::Error> {
	let entry_list = entry::Model::find_all();

	if !entry_list.is_empty() {
		let site = site::Model::load()?;
		let html = View { site, entry_list }.render()?;

		Ok((
			StatusCode::OK,
			[(header::CONTENT_TYPE, "text/html; charset=utf-8")],
			html,
		)
			.into_response())
	} else {
		not_found::handler().await
	}
}
