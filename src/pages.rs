use crate::common::{cacheable_response, CustomError};
use crate::models::*;
use crate::views::page_layout;
use actix_files::NamedFile;
use actix_web::{web, Result};
use maud::{html, Markup, PreEscaped};
use std::path::Path;

pub async fn home() -> Result<NamedFile> {
  cacheable_response(Path::new("index.html"), || {
    let site_content = Site::read();
    let blog_content = Blog::read();

    let children = match blog_content.posts.len() {
      len if len > 1 => html! {
        ol .Home.post-list {
          @for post in blog_content.posts {
            li .Home.post {
              h2 .Home.post-title {
                a href={ "/post/" (post.slug) ".html" } { (post.title) }
              }
              p .Home.post-description { (post.description ) }
            }
          }
        }
      },
      _ => {
        if let Some(post) = blog_content.posts.first() {
          get_post_html(post)
        } else {
          html! {
            h1 .Content.heading { "Nothing written yet." }
          }
        }
      }
    };

    page_layout(
      site_content.to_owned(),
      "Home",
      children,
      Some(html! {
        h1 .Banner.heading { (site_content.title) }
      }),
    )
  })
}

pub async fn feed_rss() -> Result<NamedFile> {
  use rss::{ChannelBuilder, ItemBuilder};

  cacheable_response(Path::new("feed.rss"), || {
    let site_content = Site::read();
    let blog_content = Blog::read();

    let mut channel = ChannelBuilder::default();

    let base = site_content.base;

    let channel = channel
      .link(&base)
      .title(site_content.title)
      .description(site_content.description);

    for post in blog_content.posts {
      let slug = post.slug;

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
    let site_content = Site::read();
    let blog_content = Blog::read();

    match blog_content
      .posts
      .iter()
      .find(|post| post.slug == slug.to_string())
      .and_then(|post| Some(post))
    {
      Some(post) => page_layout(
        site_content.to_owned(),
        post.title.as_str(),
        get_post_html(post.to_owned()),
        None,
      ),
      _ => Err(CustomError::NotFound {}),
    }
  })
}

fn get_post_html(post: &Post) -> Markup {
  html! {
    h1 .Content.heading { (post.title) }
    p {
      time.Content.date {
        svg .Content.date-icon viewBox="0 0 100 100" {
          rect
            width="100"
            height="100"
            x="0"
            y="0"
            rx="6"
            stroke-width="0" {}
          rect .Icon.bg-fill width="82" height="61" x="9" y="30" stroke-width="0" {}
          rect width="28" height="28" x="18" y="39" stroke-width="0" {}
        }
        (post.date.format("%B %e, %Y"))
      }
    }

    (PreEscaped(post.content.to_owned()))
  }
}
