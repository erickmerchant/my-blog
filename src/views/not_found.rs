use axum::{
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use minijinja::context;
use std::sync::Arc;

pub async fn not_found_view(app_state: Arc<crate::State>) -> Result<Response, crate::Error> {
	let ctx = context! {};
	let body = app_state
		.templates
		.render("layouts/not-found.jinja".to_string(), ctx)?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
