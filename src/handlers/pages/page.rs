use crate::{models::page::*, models::site::*, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use minijinja::{context, Environment};
use std::path::Path;

pub async fn handle(
    slug: web::Path<String>,
    site: web::Data<Site>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    let slug = slug.as_ref();
    let path = Path::new("pages").join(slug).with_extension("html");

    responses::cacheable(&path, || {
        let page = Page::get_by_slug(slug.to_string());

        if let Some(page) = page {
            let ctx = context! {
                site => &site.as_ref(),
                title => &page.title,
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
