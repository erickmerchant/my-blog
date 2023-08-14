use super::not_found;
use crate::{
	error::AppError,
	models::{entry, entry_tag, tag},
	state::AppState,
};
use axum::{
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use mime_guess::mime::TEXT_HTML_UTF_8;
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*, sea_query::Query};
use std::sync::Arc;

pub async fn view(
	app_state: Arc<AppState>,
	condition: Condition,
	template_override: Option<String>,
	content_type: String,
	may_redirect: bool,
) -> anyhow::Result<Response, AppError> {
	let results = entry::Entity::find()
		.filter(condition)
		.find_with_related(tag::Entity)
		.all(&app_state.database)
		.await?;

	if let Some((entry, entry_tags)) = results.get(0) {
		if let Some(permalink) = if !may_redirect {
			None
		} else {
			entry.clone().permalink
		} {
			Ok((
				[(header::LOCATION, permalink)],
				StatusCode::MOVED_PERMANENTLY,
			)
				.into_response())
		} else {
			let category_entries = entry::Entity::find()
				.filter(entry::Column::Category.eq(entry.slug.clone()))
				.order_by(entry::Column::Date, Order::Desc)
				.find_with_related(tag::Entity)
				.all(&app_state.database)
				.await?;

			let tag = tag::Entity::find()
				.filter(tag::Column::Slug.eq(entry.slug.clone()))
				.one(&app_state.database)
				.await?;

			let tag_entries = if let Some(tag) = tag {
				entry::Entity::find()
					.filter(
						entry::Column::Id.in_subquery(
							Query::select()
								.from(entry_tag::Entity)
								.column(entry_tag::Column::EntryId)
								.and_where(entry_tag::Column::TagId.eq(tag.id))
								.to_owned(),
						),
					)
					.order_by(entry::Column::Date, Order::Desc)
					.find_with_related(tag::Entity)
					.all(&app_state.database)
					.await?
			} else {
				vec![]
			};

			let template = template_override.unwrap_or(
				entry
					.clone()
					.template
					.unwrap_or("layouts/entry.jinja".to_string()),
			);

			let html = app_state
				.templates
				.get_template(template.as_str())
				.and_then(|template| {
					template.render(context! {
						entry => entry,
						category_entries => category_entries,
						tag_entries => tag_entries,
						entry_tags => entry_tags,
					})
				})?;
			let body = html.as_bytes().to_vec();

			Ok(([(header::CONTENT_TYPE, content_type)], body).into_response())
		}
	} else if content_type == TEXT_HTML_UTF_8.to_string() {
		not_found::view(app_state)
	} else {
		Ok(StatusCode::NOT_FOUND.into_response())
	}
}
