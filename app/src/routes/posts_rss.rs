use crate::models::*;
use crate::{queries, queries::Pool, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use minijinja::{context, Environment};
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

        let posts: Vec<Page> = match web::block(move || -> Result<Vec<Page>, rusqlite::Error> {
            queries::get_all_pages(conn, "posts")
        })
        .await?
        {
            Ok(posts) => posts,
            Err(error) => {
                println!("{error:?}");

                vec![]
            }
        };

        let ctx = context! {
            posts => posts,
        };
        let html = template_env
            .get_template("posts-rss.jinja")
            .and_then(|template| template.render(ctx))
            .map_err(ErrorInternalServerError)?;

        responses::Cache::set(src, html)?
    };

    responses::file(file, src)
}
