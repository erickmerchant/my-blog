use crate::{error, models::site, state};
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
	pub site: site::Model,
}

pub async fn handler(State(state): State<Arc<state::State>>) -> Result<Response, error::Error> {
	let site = site::Model::read(&state.base_dir).await?;
	let body = View { site }.render()?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
