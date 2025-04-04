use crate::{error, filters, models::Resume, state};
use askama::Template;
use axum::{
	extract::State,
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use std::sync::Arc;

#[derive(Template)]
#[template(path = "resume.html")]
struct View {
	resume: Resume,
}

pub async fn resume_handler(
	State(state): State<Arc<state::State>>,
) -> Result<Response, error::Error> {
	let resume = state.model.resume().await?;
	let view = View { resume };
	let body = view.render()?;

	Ok((StatusCode::OK, Html(body)).into_response())
}
