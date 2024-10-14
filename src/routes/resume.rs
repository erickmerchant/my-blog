use crate::{filters, models::resume};
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

pub async fn handler(State(state): State<Arc<crate::State>>) -> Result<Response, crate::Error> {
	let resume = resume::Model::read(&state.base_dir).await?;
	let view = View { resume };
	let body = view.render()?;

	Ok((StatusCode::OK, Html(body)).into_response())
}
