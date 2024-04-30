use super::not_found::not_found_handler;
use crate::{
	filters,
	models::{entry, site},
};
use askama::Template;
use axum::{
	extract::Path,
	http::header,
	response::{IntoResponse, Response},
};

#[derive(Template)]
#[template(path = "entry.html")]
struct View {
	pub site: site::Model,
	pub entry: entry::Model,
}

pub async fn entry_handler(Path(slug): Path<String>) -> Result<Response, crate::Error> {
	let entry: Option<entry::Model> = entry::Model::find_by_slug(&slug);

	if let Some(entry) = entry {
		let site = site::Model::load()?;
		let html = View { site, entry }.render()?;

		Ok(([(header::CONTENT_TYPE, "text/html; charset=utf-8")], html).into_response())
	} else {
		not_found_handler().await
	}
}
