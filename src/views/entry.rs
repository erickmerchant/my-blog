use super::not_found::not_found_view;
use crate::models::{entry, entry_tag, tag};
use axum::{
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use minijinja::context;
use sea_orm::{
	entity::prelude::*,
	query::{Order, QueryOrder},
	sea_query::Query,
};
use std::sync::Arc;

pub async fn entry_view(
	app_state: Arc<crate::State>,
	results: Option<&(entry::Model, Vec<tag::Model>)>,
	template_override: Option<String>,
	content_type: String,
	may_redirect: bool,
) -> Result<Response, crate::Error> {
	if let Some((entry, entry_tags)) = results {
		let permalink = if !may_redirect {
			None
		} else {
			entry.clone().permalink
		};

		if let Some(permalink) = permalink {
			return Ok((
				[(header::LOCATION, permalink)],
				StatusCode::MOVED_PERMANENTLY,
			)
				.into_response());
		}

		let feed = match entry.feed {
			Some(entry::Feed::Category) => Some(
				entry::Entity::find()
					.filter(entry::Column::Category.eq(entry.slug.clone()))
					.order_by(entry::Column::Date, Order::Desc)
					.find_with_related(tag::Entity)
					.all(&app_state.database)
					.await?,
			),
			Some(entry::Feed::Tag) => Some(
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
		let html = app_state.templates.render(
			template,
			context! {
				entry,
				feed,
				entry_tags,
			},
		)?;
		let body = html.as_bytes().to_vec();

		return Ok(([(header::CONTENT_TYPE, content_type)], body).into_response());
	}

	if content_type == *"text/html; charset=utf-8" {
		not_found_view(app_state).await
	} else {
		Ok(StatusCode::NOT_FOUND.into_response())
	}
}
