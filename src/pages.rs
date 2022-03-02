use crate::common::{cacheable_response, CustomError};
use crate::templates::page_layout;
use actix_files::NamedFile;
use actix_web::{web, Result};
use maud::{html, PreEscaped};
use serde::{Deserialize, Serialize};
use std::{fs, path::Path};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Post {
  title: String,
  description: String,
  content: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Feed {
  posts: std::collections::HashMap<String, Post>,
}

fn get_feed() -> Feed {
  let file_contents =
    fs::read_to_string("content/Posts.toml").expect("failed to read content/Posts.toml");
  let feed = toml::from_str::<Feed>(&file_contents).expect("failed to parse content/Posts.toml");

  feed
}

pub async fn home() -> Result<NamedFile> {
  cacheable_response(Path::new("index.html"), || {
    let feed = get_feed();

    page_layout(
      "Home",
      html! {
        ol .Home.post-list {
          @for (slug, post) in feed.posts {
            li .Home.post {
              h2 .Home.post-title { a href={ "/post/" (slug) ".html" } { (post.title) } }
              p .Home.post-description { (post.description ) }
            }
          }
        }
      },
      Some(html! {
        h1 .Banner.heading { "ErickMerchant.com" }
      }),
    )
  })
}

pub async fn feed_rss() -> Result<NamedFile> {
  use rss::{ChannelBuilder, ItemBuilder};

  cacheable_response(Path::new("feed.rss"), || {
    let feed = get_feed();

    let mut channel = ChannelBuilder::default();

    let channel = channel
      .link("https://erickmerchant.com/")
      .title("ErickMerchant.com")
      .description("The personal site of Erick Merchant.");

    for (slug, post) in feed.posts {
      channel.item(
        ItemBuilder::default()
          .link(format!("https://erickmerchant.com/post/{slug}.html"))
          .title(post.title)
          .description(post.description)
          .build(),
      );
    }

    let channel = channel.build();

    Ok(channel.to_string())
  })
}

pub async fn post(post: web::Path<String>) -> Result<NamedFile> {
  let slug = Path::new(post.as_ref().as_str()).with_extension("");

  let slug = slug.to_str().expect("invalid slug");

  cacheable_response(post.as_ref().as_str(), || {
    let feed = get_feed();

    match feed.posts.get(slug).and_then(|post| Some(post)) {
      Some(post) => page_layout(
        post.title.as_str(),
        html! {
          h1 .Content.heading { (post.title) }
          (PreEscaped(post.content.to_owned()))
        },
        None,
      ),
      _ => Err(CustomError::NotFound {}),
    }
  })
}
