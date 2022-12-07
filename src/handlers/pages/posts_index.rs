use crate::{models::entry::*, models::site::*, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use minijinja::{context, Environment};
use std::path::Path;

pub async fn handle(
    site: web::Data<Site>,
    template_env: web::Data<Environment<'_>>,
) -> Result<NamedFile> {
    responses::cacheable(Path::new("index.html"), || {
        let posts = Entry::get_all("content/posts/*.html");
        let posts_index_page = Entry::get_one("content/pages/posts.html").unwrap_or_default();

        match !posts.is_empty() {
            true => {
                let ctx = context! {
                    site => &site.as_ref(),
                    page => &posts_index_page,
                    posts => &posts,
                };

                template_env
                    .get_template("posts.html")
                    .and_then(|template| template.render(ctx))
                    .map_err(ErrorInternalServerError)
            }
            false => Err(ErrorNotFound("not found")),
        }
    })
}
