use crate::{models::*, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use minijinja::{context, Environment};
use std::path::Path;

pub async fn posts_index(
    site: web::Data<Site>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    responses::cacheable(Path::new("index.html"), || {
        let posts = Page::get_all("posts/*.html");
        let posts_index_page = Page::get_one("posts.html").unwrap_or_default();

        match !posts.is_empty() {
            true => {
                let ctx = context! {
                    site => &site.as_ref(),
                    page => &posts_index_page,
                    posts => &posts,
                };

                template_env
                    .get_template("posts-index.jinja")
                    .and_then(|template| template.render(ctx))
                    .map_err(ErrorInternalServerError)
            }
            false => Err(ErrorNotFound("not found")),
        }
    })
}
