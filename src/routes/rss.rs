use crate::models::{entry, site, status::Status};
use axum::{
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use rinja::Template;

#[derive(Template)]
#[template(path = "rss.xml")]
pub struct View {
	pub site: site::Model,
	pub entry_list: Vec<entry::Model>,
}

pub async fn handler() -> Result<Response, crate::Error> {
	let entry_list = entry::Model::all().await;
	let site = site::Model::read().await?;
	let html = View { site, entry_list }.render()?;

	Ok((
		StatusCode::OK,
		[(header::CONTENT_TYPE, "application/rss+xml")],
		html,
	)
		.into_response())
}
