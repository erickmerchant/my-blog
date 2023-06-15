use crate::{error::AppError, state::AppState};
use axum::{
	extract::State, http::StatusCode, response::Html, response::IntoResponse, response::Response,
};
use minijinja::context;
use std::sync::Arc;

pub fn not_found(State(app_state): State<Arc<AppState>>) -> Result<Response, AppError> {
	let title = "Page Not Found".to_string();
	let description = "That page was moved, removed, or never existed.".to_string();
	let ctx = context! {
		site => app_state.site,
		page => context! {
			title => title,
			description => description,
		}
	};
	let template = app_state.templates.get_template("layouts/error.jinja")?;
	let body = template.render(ctx)?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
