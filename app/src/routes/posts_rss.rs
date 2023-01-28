use crate::responses;
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use minijinja::{context, Environment};
use schema::*;
use std::path::Path;

pub async fn posts_rss(template_env: web::Data<Environment<'_>>) -> Result<NamedFile> {
    responses::cacheable(Path::new("posts.rss"), || {
        let ctx = context! {
            posts => &Page::get_all("posts"),
        };
        template_env
            .get_template("posts-rss.jinja")
            .and_then(|template| template.render(ctx))
            .map_err(ErrorInternalServerError)
    })
}
