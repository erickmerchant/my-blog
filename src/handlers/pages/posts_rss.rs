use crate::{models::page::*, models::site::*, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use minijinja::{context, Environment};
use std::path::Path;

pub async fn handle(
    site: web::Data<Site>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    responses::cacheable(Path::new("posts.rss"), || {
        let ctx = context! {
            site => &site.as_ref(),
            posts => &Page::get_all("content/posts/*.html"),
        };
        template_env
            .get_template("posts_rss.jinja")
            .and_then(|template| template.render(ctx))
            .map_err(ErrorInternalServerError)
    })
}
