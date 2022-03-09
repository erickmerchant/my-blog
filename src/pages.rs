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
    let posts: Vec<Option<Post>> = site_content
      .posts
      .iter()
      .map(|slug| Post::read(slug.to_string()))
      .collect();

    let children = match posts.len() {
      len if len > 1 => html! {
        ol .Home.post-list {
          @for post in posts {
            @if let Some(post) = post {
              li .Home.post {
                h2 .Home.post-title {
                  a href={ "/posts/" (post.data.slug) ".html" } { (post.data.title) }
                }
                p .Home.post-description { (post.data.description ) }
              }
            }
          }
        }
      },
      _ => {
        if let Some(post) = posts.get(0) {
          get_post_html(post.to_owned())
        } else {
          get_post_html(None)
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
        get_post_html(Some(post.to_owned())),
        None,
      ),
      _ => Err(CustomError::NotFound {}),
    }
  })
}

fn get_post_html(post: Option<Post>) -> Markup {
  match post {
    Some(post) => html! {
      h1 .Content.heading { (post.data.title) }
      p .Content.date-paragraph {
        time .Content.date {
          svg
            .Content.date-icon
            viewBox="0 0 100 100"
            aria-hidden="true" {
            rect
              width="100"
              height="100"
              x="0"
              y="0"
              rx="6" {}
            rect
              .Icon.bg-fill
              width="82"
              height="61"
              x="9"
              y="30" {}
            rect
              width="4"
              height="100"
              x="26"
              y="0" {}
            rect
              width="4"
              height="100"
              x="48"
              y="0" {}
            rect
              width="4"
              height="100"
              x="70"
              y="0" {}
            rect
              width="100"
              height="4"
              x="0"
              y="42" {}
            rect
              width="100"
              height="4"
              x="0"
              y="58" {}
            rect
              width="100"
              height="4"
              x="0"
              y="75" {}
          }
          @if let Ok(date) = chrono::NaiveDate::parse_from_str(post.data.date.as_str(), "%Y-%m-%d") {
            (date.format("%B %e, %Y"))
          }
        }
      }

      (PreEscaped(post.content.to_owned()))
    },
    None => html! {
      h1 .Content.heading { "Nothing written yet." }
    },
  }
}
