use super::not_found::not_found_handler;
use crate::models::entry::Model;
use axum::{
	extract::{Path, State},
	http::header,
	response::{IntoResponse, Response},
};
use minijinja::context;
use std::sync::Arc;

pub async fn entry_handler(
	State(templates): State<Arc<crate::templates::Engine>>,
	Path(slug): Path<String>,
) -> Result<Response, crate::Error> {
	let entry: Option<Model> = Model::find_by_slug(&slug);

	if entry.is_none() {
		return not_found_handler(State(templates)).await;
	}

	let html = templates.render(
		"entry.jinja".to_string(),
		Some(context! {
			entry,
		}),
	)?;

	Ok(([(header::CONTENT_TYPE, "text/html; charset=utf-8")], html).into_response())
}
