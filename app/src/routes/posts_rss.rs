use crate::{models::*, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use minijinja::{context, Environment};
use std::path::Path;

pub async fn posts_rss(
    site: web::Data<Site>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    responses::cacheable(Path::new("posts.rss"), || {
        let ctx = context! {
            site => &site.as_ref(),
            posts => &Page::get_all("posts/*.html"),
        };
        template_env
            .get_template("posts-rss.jinja")
            .and_then(|template| template.render(ctx))
            .map_err(ErrorInternalServerError)
    })
}
