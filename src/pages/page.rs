use crate::{models, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use minijinja::{context, Environment};
use std::path::Path;

pub async fn page(
    slug: web::Path<String>,
    site: web::Data<models::Site>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    let slug = slug.as_ref();
    let path = Path::new("pages").join(slug).with_extension("html");

    responses::cacheable(&path, || {
        let page = models::Page::get_by_slug(slug.to_string());

        match page {
            Some(page) => {
                let ctx = context! {
                    site => &site.as_ref(),
                    title => &page.title,
                    page => &page,
                };
                template_env
                    .get_template(&page.template)
                    .and_then(|template| template.render(ctx))
                    .map_err(ErrorInternalServerError)
            }
            None => Err(ErrorNotFound("not found")),
        }
    })
}
