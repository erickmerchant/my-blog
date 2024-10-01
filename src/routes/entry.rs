use super::not_found;
use crate::{
	filters,
	models::{entry, site, status::Status},
};
use axum::{
	extract::Path,
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use rinja::Template;

#[derive(Template)]
#[template(path = "entry.html")]
struct View {
	pub site: site::Model,
	pub entry: entry::Model,
}

pub async fn handler(Path(slug): Path<String>) -> Result<Response, crate::Error> {
	let entry: Option<entry::Model> = entry::Model::by_slug(&slug).await;

	if let Some(entry) = entry {
		let site = site::Model::read().await?;
		let html = View { site, entry }.render()?;

		return Ok((StatusCode::OK, Html(html)).into_response());
	}

	not_found::handler().await
}
