use crate::{cacheable, models};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use std::path::Path;
use tera::Context;

pub async fn handler(
    site: web::Data<models::site::Model>,
    tmpl: web::Data<tera::Tera>,
) -> Result<NamedFile> {
    cacheable::response(Path::new("posts.rss"), || {
        let mut ctx = Context::new();
        ctx.insert("site", &site.as_ref());
        ctx.insert("posts", &models::post::Model::get_all());
        tmpl.render("posts.rss", &ctx)
            .map_err(ErrorInternalServerError)
    })
}
