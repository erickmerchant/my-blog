use super::not_found::not_found_handler;
use crate::models::entry::Model;
use axum::{
	extract::State,
	http::header,
	response::{IntoResponse, Response},
};
use minijinja::context;
use std::sync::Arc;

pub async fn list_handler(
	State(templates): State<Arc<crate::templates::Engine>>,
) -> Result<Response, crate::Error> {
	let entry_list: Vec<Model> = Model::find_all_frontmatter();

	if entry_list.is_empty() {
		return not_found_handler(State(templates)).await;
	}

	let html = templates.render(
		"list.jinja".to_string(),
		Some(context! {
			entry_list,
		}),
	)?;

	Ok((
		[(header::CONTENT_TYPE, "text/html; charset=utf-8".to_string())],
		html,
	)
		.into_response())
}
