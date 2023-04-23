use crate::{models::page, routes::not_found, templates::minify_html, AppError, AppState};
use axum::{
    extract::Path, extract::State, response::Html, response::IntoResponse, response::Response,
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::sync::Arc;

pub async fn page(
    State(app_state): State<Arc<AppState>>,
    Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
    // let src = path::Path::new(category.as_str())
    //     .join(&slug)
    //     .with_extension("html");

    let page_category = category.clone();
    let page_slug = slug.clone();

    let page: Option<page::Model> = page::Entity::find()
        .filter(
            Condition::all()
                .add(page::Column::Category.eq(&page_category))
                .add(page::Column::Slug.eq(page_slug)),
        )
        .order_by_desc(page::Column::Date)
        .one(&app_state.database.clone())
        .await?;

    match page {
        Some(page) => {
            let next = page::Entity::find()
                .filter(page::Column::Category.eq(&page_category))
                .cursor_by((page::Column::Date, page::Column::Id))
                .order_by_desc(page::Column::Date)
                .after((page.date, page.id))
                .first(1)
                .all(&app_state.database.clone())
                .await?;

            let previous = page::Entity::find()
                .filter(page::Column::Category.eq(page_category))
                .cursor_by((page::Column::Date, page::Column::Id))
                .order_by_desc(page::Column::Date)
                .before((page.date, page.id))
                .last(1)
                .all(&app_state.database.clone())
                .await?;

            let ctx = context! {
                site => &app_state.site,
                page => &page,
                pagination => context! {
                    next => next.get(0),
                    previous => previous.get(0)
                },
            };

            let html = app_state
                .templates
                .get_template(&page.template)
                .and_then(|template| template.render(ctx))?;

            let html = minify_html(html);

            Ok(Html(html).into_response())
        }
        None => Ok(not_found(State(app_state))),
    }
}
