use crate::{models::entry::*, state::AppState};
use axum::{
	http::header,
	response::{IntoResponse, Response},
};
use minijinja::context;
use std::sync::Arc;

pub async fn view(
	app_state: Arc<AppState>,
	model: &mut Model,
	template: String,
	content_type: String,
) -> anyhow::Result<Response> {
	if let Some(mut query) = model.query.clone() {
		query.hydrate(&app_state.database).await?;

		model.query = Some(query);
	}

	let html = app_state
		.templates
		.get_template(template.as_str())
		.and_then(|template| {
			template.render(context! {
				entry => model,
			})
		})?;
	let body = html.as_bytes().to_vec();

	Ok(([(header::CONTENT_TYPE, content_type)], body).into_response())
}
