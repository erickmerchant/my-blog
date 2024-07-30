use super::not_found;
use crate::{
	filters,
	models::{entry, site, state::State},
};
use askama::Template;
use axum::{
	extract::Path,
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};

#[derive(Template)]
#[template(path = "entry.html")]
struct View {
	pub site: site::Model,
	pub entry: entry::Model,
}

pub async fn handler(Path(slug): Path<String>) -> Result<Response, crate::Error> {
	let entry: Option<entry::Model> = entry::Model::load_by_slug(&slug);

	if let Some(entry) = entry {
		let site = site::Model::load()?;
		let html = View { site, entry }.render()?;

		return Ok((
			StatusCode::OK,
			[(header::CONTENT_TYPE, "text/html; charset=utf-8")],
			html,
		)
			.into_response());
	}

	not_found::handler().await
}
