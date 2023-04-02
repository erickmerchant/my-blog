use crate::models::page;
use crate::templates::minify_html;
use crate::AppState;
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use actix_web_lab::extract;
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::path::Path;

pub async fn page(
    app_state: web::Data<AppState>,
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
                    .after((page.date.clone(), page.id))
                    .first(1)
                    .all(&app_state.database.clone())
                    .await
                    .map_err(ErrorInternalServerError)?;

                let previous = page::Entity::find()
                    .filter(page::Column::Category.eq(page_category))
                    .cursor_by((page::Column::Date, page::Column::Id))
                    .order_by_desc(page::Column::Date)
                    .before((page.date.clone(), page.id))
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
