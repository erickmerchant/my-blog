mod models;
mod views;

use crate::assets;
use crate::common::cacheable_response;
use actix_files::NamedFile;
use actix_web::{web, Result};
use std::path::Path;
pub use views::{internal_error, not_found};

pub fn configure(cfg: &mut web::ServiceConfig) {
  cfg.service(
    web::scope("")
      .route("/", web::get().to(home))
      .route("/feed.rss", web::get().to(feed_rss))
      .route("/posts/{post:.*.html}", web::get().to(post))
      .route("/{file:.*?}", web::get().to(assets::file)),
  );
}

pub async fn home() -> Result<NamedFile> {
  cacheable_response(
    Path::new("index.html"),
    || {
      let site = models::Site::read();
      let posts: Vec<Option<models::Post>> = site
        .posts
        .iter()
        .map(|slug| models::Post::read(slug.to_string()))
        .collect();

      views::home_page(site, posts)
    },
    None,
  )
}

pub async fn feed_rss() -> Result<NamedFile> {
  use rss::{ChannelBuilder, ItemBuilder};

  cacheable_response(
    Path::new("feed.rss"),
    || {
      let site_content = models::Site::read();

      let posts: Vec<Option<models::Post>> = site_content
        .posts
        .iter()
        .map(|slug| models::Post::read(slug.to_string()))
        .collect();

      let mut channel = ChannelBuilder::default();

      let base = site_content.base;

      let channel = channel
        .link(&base)
        .title(site_content.title)
        .description(site_content.description);

      for post in posts {
        if let Some(post) = post {
          let slug = post.data.slug;

          channel.item(
            ItemBuilder::default()
              .link(format!("{base}/posts/{slug}.html"))
              .title(post.data.title)
              .description(post.data.description)
              .build(),
          );
        }
      }

      let channel = channel.build();

      Ok(channel.to_string())
    },
    None,
  )
}

pub async fn post(post: web::Path<String>) -> Result<NamedFile> {
  let slug = Path::new(post.as_ref().as_str()).with_extension("");

  let slug = slug.to_str().expect("invalid slug");

  cacheable_response(
    post.as_ref().as_str(),
    || {
      let site = models::Site::read();

      views::post_page(site, models::Post::read(slug.to_string()))
    },
    None,
  )
}
