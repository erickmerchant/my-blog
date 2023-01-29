use crate::responses;
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use actix_web_lab::extract;
use minijinja::{context, Environment};
use schema::*;

pub async fn page(
    extract::Path((category, slug)): extract::Path<(String, String)>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    let src = format!("{category}/{slug}.html");

    let file = if let Some(file) = responses::Cache::get(&src) {
        file?
    } else {
        // let page = Page::get_one(format!("{category}"), format!("{slug}"));

        let page = Page {
            category,
            slug,
            ..Page::default()
        };

        // if let Some(page) = page {
        let ctx = context! {
            page => &page,
        };

        let html = template_env
            .get_template(&page.template)
            .and_then(|template| template.render(ctx))
            .map_err(ErrorInternalServerError)?;

        responses::Cache::set(&src, html)?
        // } else {
        //     Err(ErrorNotFound("not found"))
        // }
    };

    responses::file(file, src)
}
