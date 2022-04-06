use super::models;
use crate::common::{html_response, CustomError};
use maud::{html, Markup, PreEscaped, Render, DOCTYPE};

struct Layout {
  content: models::Site,
  title: String,
  children: Markup,
  heading: Option<Markup>,
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
          link href="/vendor/@hyper-views/framework/main.js" rel="modulepreload";
          title { (self.title) " | " (self.content.title) }
          script type="module" src="/main.js" {}
        }
        body {
          side-nav .SideNav.self {
            header .Banner.self slot="panel" {
              @match self.heading.clone() {
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
              @for link in self.content.clone().links {
                li { a .Links.link href=(link.href) { (link.title) } }
              }
            }
          }
        }
      }
    }
  }
}

struct Post {
  post: Option<models::Post>,
}

impl Render for Post {
  fn render(&self) -> Markup {
    match self.post.clone() {
      Some(post) => html! {
        h1 .Content.heading1 { (post.data.title) }
        p .Content.date-paragraph {
          svg
            .Icon.self
            viewBox="0 0 95 95"
            aria-hidden="true" {
            rect height="25" width="95" x="0" y="0" {}
            rect height="60" width="95" x="0" y="35" {}
          }
          time {
            @if let Ok(date) = chrono::NaiveDate::parse_from_str(post.data.date.as_str(), "%Y-%m-%d") {
              (date.format("%B %e, %Y"))
            }
          }
        }

        (PreEscaped(post.content.clone()))
      },
      None => html! {
        h1 .Content.heading1 { "Nothing has been written yet." }
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
      post: posts.get(0).and_then(|p| p.clone()),
    }
    .render(),
  };

  html_response(Layout {
    content: site.clone(),
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
      content: site.clone(),
      title: post.data.title.clone(),
      children: Post {
        post: Some(post.clone()),
      }
      .render(),
      heading: None,
    }),
    None => Err(CustomError::NotFound {}),
  }
}

pub fn not_found() -> Result<String, CustomError> {
  let title = "Page Not Found";

  let content = models::Site::get();

  html_response(Layout {
    content: content.clone(),
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

  let content = models::Site::get();

  html_response(Layout {
    content: content.clone(),
    title: title.to_string(),
    children: html! {
      h1 .Content.heading1 { (title) }
      p .Content.paragraph { "An error occurred. Please try again later." }
    },
    heading: None,
  })
}
