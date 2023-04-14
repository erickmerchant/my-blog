use crate::{models::page, AppState};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::path::Path;
use std::vec::Vec;

pub async fn rss(app_state: web::Data<AppState>, category: web::Path<String>) -> Result<NamedFile> {
    let src = Path::new(category.as_str()).with_extension("rss");

    let file = if let Some(file) = super::Cache::get(&src) {
        file?
    } else {
        let pages: Vec<page::Model> = page::Entity::find()
            .filter(page::Column::Category.eq(category.as_str()))
            .order_by_desc(page::Column::Date)
            .all(&app_state.database.clone())
            .await
            .map_err(ErrorInternalServerError)?;

        let ctx = context! {
            site => &app_state.site,
            pages => pages,
        };
        let html = app_state
            .templates
            .get_template("layouts/rss.jinja")
            .and_then(|template| template.render(ctx))
            .map_err(ErrorInternalServerError)?;

        super::Cache::set(&src, html)?
    };

    super::file(file, src)
}
