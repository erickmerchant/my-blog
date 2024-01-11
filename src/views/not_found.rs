use axum::{
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use std::sync::Arc;

pub async fn not_found_view(app_state: Arc<crate::State>) -> Result<Response, crate::Error> {
	let body = app_state
		.templates
		.render("not-found.jinja".to_string(), None)?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
