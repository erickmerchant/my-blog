use axum::{
	extract::State,
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use std::sync::Arc;

pub async fn not_found_handler(
	State(templates): State<Arc<crate::templates::Engine>>,
) -> Result<Response, crate::Error> {
	let body = templates.render("not-found.jinja".to_string(), None)?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
