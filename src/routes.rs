use crate::assets;
use crate::common::{cacheable_response, render_template, CustomError};
use crate::models;
use crate::views;
use actix_files::NamedFile;
use actix_web::{web, Result};
use std::path::Path;

pub fn configure(cfg: &mut web::ServiceConfig) {
  cfg.service(
    web::scope("")
      .route("/", web::get().to(home))
      .route("/feed.rss", web::get().to(feed_rss))
      .route("/posts/{post:.*.html}", web::get().to(post))
      .route("/{file:.*?}", web::get().to(assets::file)),
  );
}

async fn home() -> Result<NamedFile> {
  cacheable_response(Path::new("index.html"), || {
    let site = models::Site::get();
    let posts: Vec<Option<models::Post>> = site
      .posts
      .iter()
      .map(|slug| models::Post::get_by_slug(slug.to_string()))
      .collect();

    let title = "Home".to_string();

    match posts.len() > 1 {
      true => render_template(views::Home { site, title, posts }),
      false => render_template(views::Post {
        site,
        title,
        post: posts.get(0).and_then(|p| p.clone()),
      }),
    }
  })
}

async fn feed_rss() -> Result<NamedFile> {
  cacheable_response(Path::new("feed.rss"), || {
    let site = models::Site::get();
    let posts: Vec<Option<models::Post>> = site
      .posts
      .iter()
      .map(|slug| models::Post::get_by_slug(slug.to_string()))
      .collect();

    render_template(views::Feed { site, posts })
  })
}

async fn post(post: web::Path<String>) -> Result<NamedFile> {
  let slug = Path::new(post.as_ref().as_str()).with_extension("");

  let slug = slug.to_str().expect("invalid slug");

  cacheable_response(post.as_ref().as_str(), || {
    let site = models::Site::get();

    let post = models::Post::get_by_slug(slug.to_string());

    match post {
      Some(post) => render_template(views::Post {
        site,
        title: post.data.title.clone(),
        post: Some(post),
      }),
      None => Err(CustomError::NotFound {}),
    }
  })
}
