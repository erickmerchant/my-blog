use crate::{models, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use minijinja::{context, Environment};
use std::path::Path;

pub async fn post(
    slug: web::Path<String>,
    site: web::Data<models::Site>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    let slug = slug.as_ref();
    let path = Path::new("posts").join(slug).with_extension("html");

    responses::cacheable(&path, || {
        let post = models::Post::get_by_slug(slug.to_string());

        match post {
            Some(post) => {
                let ctx = context! {
                    site => &site.as_ref(),
                    title => &post.title,
                    post => &post,
                };
                template_env
                    .get_template("post.html")
                    .and_then(|template| template.render(ctx))
                    .map_err(ErrorInternalServerError)
            }
            None => Err(ErrorNotFound("not found")),
        }
    })
}
