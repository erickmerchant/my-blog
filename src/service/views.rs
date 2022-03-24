use super::models;
use crate::common::{html_response, CustomError};
use maud::{html, Markup, PreEscaped, Render, DOCTYPE};

pub struct Layout {
  pub content: models::Site,
  pub title: String,
  pub children: Markup,
  pub heading: Option<Markup>,
}

impl Render for Layout {
  fn render(&self) -> Markup {
    html! {
      (DOCTYPE)
      html lang="en-US" {
        head {
          meta charset="utf-8";
          meta name="viewport" content="width=device-width, initial-scale=1";
          meta name="description" content=(self.content.description);
          link href="/main.css" rel="stylesheet";
          link href="/favicon.svg" rel="icon" type="image/svg+xml";
          link href="/html.js" rel="modulepreload";
          title { (self.title) " | " (self.content.title) }
          script type="module" src="/main.jsx" {}
        }
        body {
          side-nav .SideNav.self {
            header .Banner.self slot="panel" {
              @match self.heading.to_owned() {
                Some(heading) => { (heading) }
                None => {
                  .Banner.heading { (self.content.title) }
                }
              }
            }

            main .Content.self slot="panel" {
              (self.children)
            }

            footer .Footer.self slot="panel" {
              p .Footer.copyright { (self.content.copyright) }
            }

            ol .Links.self slot="links" {
              @for link in self.content.to_owned().links {
                li { a .Links.link href=(link.href) { (link.title) } }
              }
            }
          }
        }
      }
    }
  }
}

pub struct Post {
  pub post: Option<models::Post>,
}

impl Render for Post {
  fn render(&self) -> Markup {
    match self.post.to_owned() {
      Some(post) => html! {
        h1 .Content.heading1 { (post.data.title) }
        p .Content.date-paragraph {
          svg
            .Icon.self
            viewBox="0 0 95 95"
            aria-hidden="true" {
            rect
              height="25"
              width="25"
              x="0"
              y="0" {}
            rect
              height="25"
              width="25"
              x="35"
              y="0" {}
            rect
              height="25"
              width="25"
              x="70"
              y="0" {}
            rect
              height="25"
              width="25"
              x="0"
              y="35" {}
            rect
              height="25"
              width="25"
              x="35"
              y="35" {}
            rect
              height="25"
              width="25"
              x="70"
              y="35" {}
            rect
              height="25"
              width="25"
              x="0"
              y="70" {}
            rect
              height="25"
              width="25"
              x="35"
              y="70" {}
            rect
              height="25"
              width="25"
              x="70"
              y="70" {}
          }
          time {
            @if let Ok(date) = chrono::NaiveDate::parse_from_str(post.data.date.as_str(), "%Y-%m-%d") {
              (date.format("%B %e, %Y"))
            }
          }
        }

        (PreEscaped(post.content.to_owned()))
      },
      None => html! {
        h1 .Content.heading1 { "Nothing written yet." }
      },
    }
  }
}

pub fn home_page(
  site: models::Site,
  posts: Vec<Option<models::Post>>,
) -> Result<String, CustomError> {
  let children = match posts.len() > 1 {
    true => html! {
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
    false => Post {
      post: posts.get(0).and_then(|p| p.to_owned()),
    }
    .render(),
  };

  html_response(Layout {
    content: site.to_owned(),
    title: "Home".to_string(),
    children: children,
    heading: Some(html! {
      h1 .Banner.heading { (site.title) }
    }),
  })
}

pub fn post_page(site: models::Site, post: Option<models::Post>) -> Result<String, CustomError> {
  match post {
    Some(post) => html_response(Layout {
      content: site.to_owned(),
      title: post.data.title.to_owned(),
      children: Post {
        post: Some(post.to_owned()),
      }
      .render(),
      heading: None,
    }),
    None => Err(CustomError::NotFound {}),
  }
}

pub fn not_found() -> Result<String, CustomError> {
  let title = "Page Not Found";

  let content = models::Site::read();

  html_response(Layout {
    content: content.to_owned(),
    title: title.to_string(),
    children: html! {
      h1 .Content.heading1 { (title) }
      p .Content.paragraph {
        "That resource was moved, removed, or never existed."
      }
    },
    heading: None,
  })
}

pub fn internal_error() -> Result<String, CustomError> {
  let title = "Internal Error";

  let content = models::Site::read();

  html_response(Layout {
    content: content.to_owned(),
    title: title.to_string(),
    children: html! {
      h1 .Content.heading1 { (title) }
      p .Content.paragraph { "An error occurred. Please try again later." }
    },
    heading: None,
  })
}
