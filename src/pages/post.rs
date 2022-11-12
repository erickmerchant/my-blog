use crate::{cacheable, models};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use std::path::Path;
use tera::Context;

pub async fn post(
    slug: web::Path<String>,
    site: web::Data<models::Site>,
    tmpl: web::Data<tera::Tera>,
) -> Result<NamedFile> {
    let slug = slug.as_ref();
    let path = Path::new("posts").join(slug).with_extension("html");

    cacheable::response(&path, || {
        let post = models::Post::get_by_slug(slug.to_string());

        match post {
            Some(post) => {
                let mut ctx = Context::new();
                ctx.insert("site", &site.as_ref());
                ctx.insert("title", &post.title.clone());
                ctx.insert("components", &post.components.clone());
                ctx.insert("post", &post);
                tmpl.render("post.html", &ctx)
                    .map_err(ErrorInternalServerError)
            }
            None => Err(ErrorNotFound("not found")),
        }
    })
}
