use crate::{error, filters, models::resume, state};
use axum::{
	extract::State,
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use rinja::Template;
use std::sync::Arc;

#[derive(Template)]
#[template(path = "resume.html")]
pub struct View {
	pub resume: resume::Model,
}

pub async fn resume_handler(
	State(state): State<Arc<state::State>>,
) -> Result<Response, error::Error> {
	let resume = state.model.resume().await?;
	let view = View { resume };
	let body = view.render()?;

	Ok((StatusCode::OK, Html(body)).into_response())
}
