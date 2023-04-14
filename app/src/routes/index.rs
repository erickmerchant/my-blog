use crate::{models::page, templates::minify_html, AppState};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::vec::Vec;

pub async fn index(
    app_state: web::Data<AppState>,
    category: web::Path<String>,
) -> Result<NamedFile> {
    let src = "index.html";

    let file = if let Some(file) = super::Cache::get(src) {
        file?
    } else {
        let pages: Vec<page::Model> = page::Entity::find()
            .filter(page::Column::Category.eq(category.as_str()))
            .order_by_desc(page::Column::Date)
            .all(&app_state.database.clone())
            .await
            .map_err(ErrorInternalServerError)?;

        let pages_index_page: Option<page::Model> = page::Entity::find()
            .filter(
                Condition::all()
                    .add(page::Column::Category.eq(""))
                    .add(page::Column::Slug.eq(category.as_str())),
            )
            .order_by_desc(page::Column::Date)
            .one(&app_state.database.clone())
            .await
            .map_err(ErrorInternalServerError)?;

        match !pages.is_empty() && pages_index_page.is_some() {
            true => {
                let ctx = context! {
                    site => &app_state.site,
                    page => &pages_index_page.unwrap(),
                    pages => &pages,
                };

                let html = app_state
                    .templates
                    .get_template("layouts/index.jinja")
                    .and_then(|template| template.render(ctx))
                    .map_err(ErrorInternalServerError)?;

                let html = minify_html(html);

                super::Cache::set(src, html)?
            }
            false => Err(ErrorNotFound("not found"))?,
        }
    };

    super::file(file, src)
}
