use crate::{filters, models::resume::Model};
use askama::Template;
use axum::{
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};

#[derive(Template)]
#[template(path = "resume.html")]
pub struct View {
	pub resume: Model,
}

pub async fn handler() -> Result<Response, crate::Error> {
	let resume = Model::read().await?;
	let view = View { resume };
	let body = view.render()?;

	Ok((StatusCode::OK, Html(body)).into_response())
}
