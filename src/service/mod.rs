mod models;
mod views;

use crate::assets;
use crate::common::{cacheable_response, html_response, CustomError};
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
      true => html_response(views::HomeTemplate {
        site: site,
        title: title,
        posts: posts,
      }),
      false => html_response(views::PostTemplate {
        site: site,
        title: title,
        post: posts.get(0).and_then(|p| p.clone()),
      }),
    }
  })
}

async fn feed_rss() -> Result<NamedFile> {
  use rss::{ChannelBuilder, ItemBuilder};

  cacheable_response(Path::new("feed.rss"), || {
    let site_content = models::Site::get();

    let posts: Vec<Option<models::Post>> = site_content
      .posts
      .iter()
      .map(|slug| models::Post::get_by_slug(slug.to_string()))
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
  })
}

async fn post(post: web::Path<String>) -> Result<NamedFile> {
  let slug = Path::new(post.as_ref().as_str()).with_extension("");

  let slug = slug.to_str().expect("invalid slug");

  cacheable_response(post.as_ref().as_str(), || {
    let site = models::Site::get();

    let post = models::Post::get_by_slug(slug.to_string());

    match post {
      Some(post) => html_response(views::PostTemplate {
        site: site,
        title: post.data.title.clone(),
        post: Some(post.clone()),
      }),
      None => Err(CustomError::NotFound {}),
    }
  })
}

pub fn not_found() -> Result<String, CustomError> {
  let title = "Page Not Found".to_string();
  let site = models::Site::get();

  html_response(views::NotFoundTemplate {
    site: site,
    title: title,
  })
}

pub fn internal_error() -> Result<String, CustomError> {
  let title = "Internal Error".to_string();
  let site = models::Site::get();

  html_response(views::InternalErrorTemplate {
    site: site,
    title: title,
  })
}
