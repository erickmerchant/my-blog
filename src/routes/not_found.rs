use crate::{error::AppError, state::AppState};
use axum::{
	extract::State,
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use minijinja::context;
use std::sync::Arc;

pub fn not_found(State(app_state): State<Arc<AppState>>) -> Result<Response, AppError> {
	let ctx = context! {};
	let template = app_state
		.templates
		.get_template("layouts/not-found.jinja")?;
	let body = template.render(ctx)?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
