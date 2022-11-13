use crate::{models, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use std::path::Path;
use tera::Context;

pub async fn home(site: web::Data<models::Site>, tmpl: web::Data<tera::Tera>) -> Result<NamedFile> {
    responses::cacheable(Path::new("index.html"), || {
        let posts = models::Post::get_all();

        match !posts.is_empty() {
            true => {
                let mut ctx = Context::new();
                ctx.insert("site", &site.as_ref());
                ctx.insert("title", &"Home".to_string());
                ctx.insert("posts", &posts);
                tmpl.render("home.html", &ctx)
                    .map_err(ErrorInternalServerError)
            }
            false => Err(ErrorNotFound("not found")),
        }
    })
}
