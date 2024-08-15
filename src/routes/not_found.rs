use crate::models::site;
use askama::Template;
use axum::{
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};

#[derive(Template)]
#[template(path = "not_found.html")]
pub struct View {
	pub site: site::Model,
}

pub async fn handler() -> Result<Response, crate::Error> {
	let site = site::Model::read().await?;
	let body = View { site }.render()?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
