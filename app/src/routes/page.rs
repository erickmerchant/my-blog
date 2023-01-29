use crate::{queries, queries::Pool, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use actix_web_lab::extract;
use minijinja::{context, Environment};
use schema::*;

pub async fn page(
    pool: web::Data<Pool>,
    extract::Path((category, slug)): extract::Path<(String, String)>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    let src = format!("{category}/{slug}.html");

    let file = if let Some(file) = responses::Cache::get(&src) {
        file?
    } else {
        let p = pool.clone();

        let conn = web::block(move || p.get())
            .await?
            .map_err(ErrorInternalServerError)?;

        let page: Page = web::block(move || -> Result<Page, rusqlite::Error> {
            queries::get_page(conn, category, slug)
        })
        .await?
        .map_err(|e| ErrorNotFound(e.to_string()))?;

        let ctx = context! {
            page => &page,
        };

        let html = template_env
            .get_template(&page.template)
            .and_then(|template| template.render(ctx))
            .map_err(ErrorInternalServerError)?;

        responses::Cache::set(&src, html)?
    };

    responses::file(file, src)
}
