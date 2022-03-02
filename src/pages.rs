use crate::common::{cacheable_response, CustomError};
use crate::content::get_site_content;
use crate::templates::page_layout;
use actix_files::NamedFile;
use actix_web::{web, Result};
use maud::{html, PreEscaped};
use std::path::Path;

pub async fn home() -> Result<NamedFile> {
  cacheable_response(Path::new("index.html"), || {
    let content = get_site_content();

    page_layout(
      content.to_owned(),
      "Home",
      html! {
        ol .Home.post-list {
          @for (slug, post) in content.posts {
            li .Home.post {
              h2 .Home.post-title { a href={ "/post/" (slug) ".html" } { (post.title) } }
              p .Home.post-description { (post.description ) }
            }
          }
        }
      },
      Some(html! {
        h1 .Banner.heading { (content.title) }
      }),
    )
  })
}

pub async fn feed_rss() -> Result<NamedFile> {
  use rss::{ChannelBuilder, ItemBuilder};

  cacheable_response(Path::new("feed.rss"), || {
    let content = get_site_content();

    let mut channel = ChannelBuilder::default();

    let base = content.base;

    let channel = channel
      .link(&base)
      .title(content.title)
      .description(content.description);

    for (slug, post) in content.posts {
      channel.item(
        ItemBuilder::default()
          .link(format!("{base}/post/{slug}.html"))
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
    let content = get_site_content();

    match content.posts.get(slug).and_then(|post| Some(post)) {
      Some(post) => page_layout(
        content.to_owned(),
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
