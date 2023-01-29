use crate::{queries, queries::Pool, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use minijinja::{context, Environment};
use rusqlite;
use schema::*;
use std::vec::Vec;

pub async fn posts_rss(
    pool: web::Data<Pool>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    let src = "posts.rss";

    let file = if let Some(file) = responses::Cache::get(src) {
        file?
    } else {
        let pool = pool.clone();

        let conn = web::block(move || pool.get())
            .await?
            .map_err(ErrorInternalServerError)?;

        let posts: Vec<Page> = web::block(move || -> Result<Vec<Page>, rusqlite::Error> {
            queries::get_all_posts(conn)
        })
        .await?
        .map_err(|e| ErrorInternalServerError(e.to_string()))?;

        match !posts.is_empty() {
            true => {
                let ctx = context! {
                    posts => posts,
                };
                let html = template_env
                    .get_template("posts-rss.jinja")
                    .and_then(|template| template.render(ctx))
                    .map_err(ErrorInternalServerError)?;

                responses::Cache::set(src, html)?
            }
            false => Err(ErrorNotFound("not found"))?,
        }
    };

    responses::file(file, src)
}
