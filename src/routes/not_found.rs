use crate::models::site;
use axum::{
	extract::State,
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use rinja::Template;
use std::sync::Arc;

#[derive(Template)]
#[template(path = "not_found.html")]
pub struct View {
	pub site: site::Entry,
}

pub async fn handler(State(state): State<Arc<crate::State>>) -> Result<Response, crate::Error> {
	let site_model = site::Model {
		fs: state.content.clone(),
	};
	let site = site_model.read().await?;
	let body = View { site }.render()?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
