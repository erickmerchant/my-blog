use super::not_found;
use crate::{
	filters,
	models::{entry, site, state::State},
};
use askama::Template;
use axum::{
	extract::Path,
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};

#[derive(Template)]
#[template(path = "entry.html")]
struct View {
	pub site: site::Model,
	pub entry: entry::Model,
}

pub async fn handler(Path(slug): Path<String>) -> Result<Response, crate::Error> {
	let entry: Option<entry::Model> = entry::Model::load_by_slug(&slug, true).await;

	if let Some(entry) = entry {
		let site = site::Model::load().await?;
		let html = View { site, entry }.render()?;

		return Ok((StatusCode::OK, Html(html)).into_response());
	}

	not_found::handler().await
}
