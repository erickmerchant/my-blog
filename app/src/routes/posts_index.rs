use crate::models::*;
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use minijinja::{context, Environment};

pub async fn posts_index(
    pool: web::Data<Pool>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    let src = "index.html";

    let file = if let Some(file) = super::Cache::get(src) {
        file?
    } else {
        let p = pool.clone();

        let conn = web::block(move || p.get())
            .await?
            .map_err(ErrorInternalServerError)?;

        let posts: Vec<Page> = match web::block(move || -> Result<Vec<Page>, rusqlite::Error> {
            Page::get_all(conn, "posts")
        })
        .await?
        {
            Ok(posts) => posts,
            Err(error) => {
                println!("{error:?}");

                vec![]
            }
        };

        let p = pool.clone();

        let conn = web::block(move || p.get())
            .await?
            .map_err(ErrorInternalServerError)?;

        let posts_index_page: Page =
            web::block(move || -> Result<Page, rusqlite::Error> { Page::get(conn, "", "posts") })
                .await?
                .map_err(|e| ErrorInternalServerError(e.to_string()))?;

        match !posts.is_empty() {
            true => {
                let ctx = context! {
                    page => &posts_index_page,
                    posts => &posts,
                };

                let html = template_env
                    .get_template("layouts/posts-index.jinja")
                    .and_then(|template| template.render(ctx))
                    .map_err(ErrorInternalServerError)?;

                super::Cache::set(src, html)?
            }
            false => Err(ErrorNotFound("not found"))?,
        }
    };

    super::file(file, src)
}
