use crate::models::entry::Model;
use axum::{
	extract::State,
	http::header,
	response::{IntoResponse, Response},
};
use minijinja::context;
use std::sync::Arc;

pub async fn rss_handler(
	State(templates): State<Arc<crate::templates::Engine>>,
) -> Result<Response, crate::Error> {
	let entry_list: Vec<Model> = Model::find_all_frontmatter();
	let html = templates.render(
		"rss.jinja".to_string(),
		Some(context! {
			entry_list,
		}),
	)?;

	Ok((
		[(header::CONTENT_TYPE, "application/rss+xml; charset=utf-8")],
		html,
	)
		.into_response())
}
