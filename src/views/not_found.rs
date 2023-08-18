use crate::{error::AppError, state::AppState};
use axum::{
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use minijinja::context;
use std::sync::Arc;

pub fn view(app_state: Arc<AppState>) -> Result<Response, AppError> {
	let ctx = context! {};
	let template = app_state
		.templates
		.get_template("layouts/not-found.jinja")?;
	let body = template.render(ctx)?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
