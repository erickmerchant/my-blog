use crate::{models::*, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use minijinja::{context, Environment};
use std::path::Path;

pub async fn page(
    file: web::Path<String>,
    site: web::Data<Site>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    let file = file.as_ref();

    responses::cacheable(Path::new(file).with_extension("html"), || {
        let page = Page::get_one(format!("{file}.html"));

        if let Some(page) = page {
            let ctx = context! {
                site => &site.as_ref(),
                page => &page,
            };

            template_env
                .get_template(&page.template)
                .and_then(|template| template.render(ctx))
                .map_err(ErrorInternalServerError)
        } else {
            Err(ErrorNotFound("not found"))
        }
    })
}
