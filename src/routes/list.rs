use super::not_found::not_found_handler;
use crate::models::{entry, entry_tag, tag, TaggedEntry};
use axum::{
	extract::{Path, State},
	http::header,
	response::{IntoResponse, Response},
};
use minijinja::context;
use sea_orm::{
	entity::prelude::*,
	query::{Order, QueryOrder},
	sea_query::Query,
};
use std::sync::Arc;

pub async fn list_handler(
	State(app_state): State<Arc<crate::State>>,
	tag_slug: Option<Path<String>>,
) -> Result<Response, crate::Error> {
	let tagged_entry_list = entry::Entity::find()
		.order_by(entry::Column::Date, Order::Desc)
		.find_with_related(tag::Entity);
	let mut tag_filter = None;
	let tagged_entry_list = if let Some(Path(tag)) = tag_slug {
		tag_filter = tag::Entity::find()
			.filter(tag::Column::Slug.eq(tag.clone()))
			.one(&app_state.database)
			.await?;

		tagged_entry_list.filter(
			entry::Column::Id.in_subquery(
				Query::select()
					.from(entry_tag::Entity)
					.left_join(
						tag::Entity,
						Expr::col((tag::Entity, tag::Column::Id))
							.equals((entry_tag::Entity, entry_tag::Column::TagId)),
					)
					.column(entry_tag::Column::EntryId)
					.and_where(tag::Column::Slug.eq(tag.clone()))
					.to_owned(),
			),
		)
	} else {
		tagged_entry_list
	};
	let tagged_entry_list = tagged_entry_list
		.all(&app_state.database)
		.await?
		.into_iter()
		.map(TaggedEntry::from)
		.collect::<Vec<_>>();

	if tagged_entry_list.is_empty() {
		return not_found_handler(State(app_state)).await;
	}

	let html = app_state.templates.render(
		"list.jinja".to_string(),
		Some(context! {
			tag_filter,
			tagged_entry_list,
		}),
	)?;
	let body = html.as_bytes().to_vec();

	Ok((
		[(header::CONTENT_TYPE, "text/html; charset=utf-8".to_string())],
		body,
	)
		.into_response())
}
