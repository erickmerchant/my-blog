use crate::{models, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use std::path::Path;
use tera::Context;

pub async fn posts_rss(
    site: web::Data<models::Site>,
    tmpl: web::Data<tera::Tera>,
) -> Result<NamedFile> {
    responses::cacheable(Path::new("posts.rss"), || {
        let mut ctx = Context::new();
        ctx.insert("site", &site.as_ref());
        ctx.insert("posts", &models::Post::get_all());
        tmpl.render("posts.rss", &ctx)
            .map_err(ErrorInternalServerError)
    })
}
