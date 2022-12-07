use crate::{models::entry::*, models::site::*, responses};
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
    let path = Path::new("posts").join(slug).with_extension("html");

    responses::cacheable(&path, || {
        let post = Entry::get_one(format!("content/posts/{slug}.html"));

        if let Some(post) = post {
            let ctx = context! {
                site => &site.as_ref(),
                post => &post,
            };

            template_env
                .get_template("post.html")
                .and_then(|template| template.render(ctx))
                .map_err(ErrorInternalServerError)
        } else {
            Err(ErrorNotFound("not found"))
        }
    })
}
