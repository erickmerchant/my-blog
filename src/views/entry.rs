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
	results: Vec<(entry::Model, Vec<tag::Model>)>,
	template_override: Option<String>,
	content_type: String,
	may_redirect: bool,
) -> anyhow::Result<Response, AppError> {
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
			let feed = match entry.feed {
				Some(entry::feed::Feed::Category) => Some(
					entry::Entity::find()
						.filter(entry::Column::Category.eq(entry.slug.clone()))
						.order_by(entry::Column::Date, Order::Desc)
						.find_with_related(tag::Entity)
						.all(&app_state.database)
						.await?,
				),
				Some(entry::feed::Feed::Tag) => Some(
					entry::Entity::find()
						.filter(
							entry::Column::Id.in_subquery(
								Query::select()
									.from(entry_tag::Entity)
									.left_join(
										tag::Entity,
										Expr::col((tag::Entity, tag::Column::Id))
											.equals((entry_tag::Entity, entry_tag::Column::TagId)),
									)
									.column(entry_tag::Column::EntryId)
									.and_where(tag::Column::Slug.eq(entry.slug.clone()))
									.to_owned(),
							),
						)
						.order_by(entry::Column::Date, Order::Desc)
						.find_with_related(tag::Entity)
						.all(&app_state.database)
						.await?,
				),
				None => None,
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
						feed => feed,
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
