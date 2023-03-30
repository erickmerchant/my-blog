use crate::templates::minify_html;
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use actix_web_lab::extract;
use minijinja::{context, Environment};
use std::path::Path;

pub async fn page(
    pool: web::Data<Pool>,
    extract::Path((category, slug)): extract::Path<(String, String)>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    let src = Path::new(category.as_str())
        .join(&slug)
        .with_extension("html");

    let file = if let Some(file) = super::Cache::get(&src) {
        file?
    } else {
        let p = pool.clone();

        let conn = web::block(move || p.get())
            .await?
            .map_err(ErrorInternalServerError)?;

        let page_category = category.clone();
        let page_slug = slug.clone();

        let page: Page = web::block(move || -> Result<Page, foo::Error> {
            Page::get(conn, page_category, page_slug)
        })
        .await?
        .map_err(ErrorNotFound)?;

        let p = pool.clone();

        let conn = web::block(move || p.get())
            .await?
            .map_err(ErrorInternalServerError)?;

        let page_category = category.clone();
        let page_slug = slug.clone();

        let pagination: Pagination = web::block(move || -> Result<Pagination, foo::Error> {
            Pagination::get(conn, page_category, page_slug)
        })
        .await?
        .map_err(ErrorNotFound)?;

        let ctx = context! {
            site => Site::get_site(),
            page => &page,
            pagination => &pagination,
        };

        let html = template_env
            .get_template(&page.template)
            .and_then(|template| template.render(ctx))
            .map_err(ErrorInternalServerError)?;

        let html = minify_html(html);

        super::Cache::set(&src, html)?
    };

    super::file(file, src)
}
