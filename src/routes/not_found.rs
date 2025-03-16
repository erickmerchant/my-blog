use crate::{error, models::Site, state};
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
	pub site: Site,
}

pub async fn not_found_handler(
	State(state): State<Arc<state::State>>,
) -> Result<Response, error::Error> {
	let site = state.model.site().await?;
	let body = View { site }.render()?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
