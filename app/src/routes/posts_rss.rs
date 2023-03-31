use crate::entities::page;
use crate::entities::page::Entity as Page;
use crate::AppState;
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::vec::Vec;

pub async fn posts_rss(app_state: web::Data<AppState>) -> Result<NamedFile> {
    let src = "posts.rss";

    let file = if let Some(file) = super::Cache::get(src) {
        file?
    } else {
        let posts: Vec<page::Model> = Page::find()
            .filter(page::Column::Category.eq("posts"))
            .order_by_desc(page::Column::Date)
            .all(&app_state.database.clone())
            .await
            .map_err(ErrorInternalServerError)?;

        let ctx = context! {
            posts => posts,
        };
        let html = app_state
            .templates
            .get_template("layouts/posts-rss.jinja")
            .and_then(|template| template.render(ctx))
            .map_err(ErrorInternalServerError)?;

        super::Cache::set(src, html)?
    };

    super::file(file, src)
}
