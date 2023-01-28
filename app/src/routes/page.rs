use crate::responses;
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use minijinja::{context, Environment};
use schema::*;
use std::path::Path;

pub async fn page(
    parts: web::Path<(String, String)>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    let parts = parts.as_ref();
    let category = parts.0.clone();
    let slug = parts.1.clone();

    responses::cacheable(
        Path::new(&category)
            .with_file_name(&slug)
            .with_extension("html"),
        || {
            let page = Page::get_one(format!("{category}"), format!("{slug}"));

            if let Some(page) = page {
                let ctx = context! {
                    page => &page,
                };

                template_env
                    .get_template(&page.template)
                    .and_then(|template| template.render(ctx))
                    .map_err(ErrorInternalServerError)
            } else {
                Err(ErrorNotFound("not found"))
            }
        },
    )
}
