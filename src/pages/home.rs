use crate::{models, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use minijinja::{context, Environment};
use std::path::Path;

pub async fn home(
    site: web::Data<models::Site>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    responses::cacheable(Path::new("index.html"), || {
        let posts = models::Post::get_all();

        match !posts.is_empty() {
            true => {
                let ctx = context! {
                    site => &site.as_ref(),
                    title => &"Home".to_string(),
                    posts => &posts,
                };

                template_env
                    .get_template("home.html")
                    .and_then(|template| template.render(ctx))
                    .map_err(ErrorInternalServerError)
            }
            false => Err(ErrorNotFound("not found")),
        }
    })
}
