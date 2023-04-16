use crate::{models::page, templates::minify_html, AppState};
use axum::extract;
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{path::Path, sync::Arc};

pub async fn page(
    extract::State(app_state): extract::State<Arc<AppState>>,
    extract::Path((category, slug)): extract::Path<(String, String)>,
) -> Result<NamedFile> {
    let src = Path::new(category.as_str())
        .join(&slug)
        .with_extension("html");

    let file = if let Some(file) = super::Cache::get(&src) {
        file?
    } else {
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
            .await
            .map_err(ErrorInternalServerError)?;

        match page {
            Some(page) => {
                let next = page::Entity::find()
                    .filter(page::Column::Category.eq(&page_category))
                    .cursor_by((page::Column::Date, page::Column::Id))
                    .order_by_desc(page::Column::Date)
                    .after((page.date, page.id))
                    .first(1)
                    .all(&app_state.database.clone())
                    .await
                    .map_err(ErrorInternalServerError)?;

                let previous = page::Entity::find()
                    .filter(page::Column::Category.eq(page_category))
                    .cursor_by((page::Column::Date, page::Column::Id))
                    .order_by_desc(page::Column::Date)
                    .before((page.date, page.id))
                    .last(1)
                    .all(&app_state.database.clone())
                    .await
                    .map_err(ErrorInternalServerError)?;

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
                    .and_then(|template| template.render(ctx))
                    .map_err(ErrorInternalServerError)?;

                let html = minify_html(html);

                super::Cache::set(&src, html)?
            }
            None => Err(ErrorNotFound("not found"))?,
        }
    };

    super::file(file, src)
}
