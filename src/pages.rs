use crate::{
  common::{cacheable_response, CustomError},
  models::*,
  views::{home_page, page_layout, post_page},
};
use actix_files::NamedFile;
use actix_web::{web, Result};
use std::path::Path;

pub async fn home() -> Result<NamedFile> {
  cacheable_response(Path::new("index.html"), || {
    let site = Site::read();
    let posts: Vec<Option<Post>> = site
      .posts
      .iter()
      .map(|slug| Post::read(slug.to_string()))
      .collect();

    home_page(site, posts)
  })
}

pub async fn feed_rss() -> Result<NamedFile> {
  use rss::{ChannelBuilder, ItemBuilder};

  cacheable_response(Path::new("feed.rss"), || {
    let site_content = Site::read();

    let posts: Vec<Option<Post>> = site_content
      .posts
      .iter()
      .map(|slug| Post::read(slug.to_string()))
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

pub async fn post(post: web::Path<String>) -> Result<NamedFile> {
  let slug = Path::new(post.as_ref().as_str()).with_extension("");

  let slug = slug.to_str().expect("invalid slug");

  cacheable_response(post.as_ref().as_str(), || {
    let site_content = Site::read();

    match Post::read(slug.to_string()) {
      Some(post) => page_layout(
        site_content.to_owned(),
        post.data.title.as_str(),
        post_page(Some(post.to_owned())),
        None,
      ),
      None => Err(CustomError::NotFound {}),
    }
  })
}
