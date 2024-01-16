use axum::{
	extract::State,
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use std::sync::Arc;

pub async fn not_found_handler(
	State(app_state): State<Arc<crate::State>>,
) -> Result<Response, crate::Error> {
	let body = app_state
		.templates
		.render("not-found.jinja".to_string(), None)?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
