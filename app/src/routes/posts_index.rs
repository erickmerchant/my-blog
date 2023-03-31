use crate::entities::page;
use crate::entities::page::Entity as Page;
use crate::templates::minify_html;
use crate::AppState;
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::vec::Vec;

pub async fn posts_index(app_state: web::Data<AppState>) -> Result<NamedFile> {
    let src = "index.html";

    let file = if let Some(file) = super::Cache::get(src) {
        file?
    } else {
        let posts: Vec<page::Model> = Page::find()
            .filter(page::Column::Category.eq("posts"))
            .order_by_desc(page::Column::Date)
            .all(&app_state.database.clone())
            .await
            .map_err(ErrorInternalServerError)?;

        let posts_index_page: Option<page::Model> = Page::find()
            .filter(
                Condition::all()
                    .add(page::Column::Category.eq(""))
                    .add(page::Column::Slug.eq("posts")),
            )
            .order_by_desc(page::Column::Date)
            .one(&app_state.database.clone())
            .await
            .map_err(ErrorInternalServerError)?;

        match !posts.is_empty() && posts_index_page.is_some() {
            true => {
                let ctx = context! {
                    page => &posts_index_page.unwrap(),
                    posts => &posts,
                };

                let html = app_state
                    .templates
                    .get_template("layouts/posts-index.jinja")
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
