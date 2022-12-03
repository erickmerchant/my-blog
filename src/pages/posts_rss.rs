use crate::{models::post, models::site, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use minijinja::{context, Environment};
use std::path::Path;

pub async fn handler(
    site: web::Data<site::Site>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    responses::cacheable(Path::new("posts.rss"), || {
        let ctx = context! {
            site => &site.as_ref(),
            posts => &post::Post::get_all(),
        };
        template_env
            .get_template("posts.rss")
            .and_then(|template| template.render(ctx))
            .map_err(ErrorInternalServerError)
    })
}
