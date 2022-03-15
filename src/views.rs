use crate::{
  common::{html_response, CustomError},
  models,
};
use maud::{html, Markup, PreEscaped, Render, DOCTYPE};

pub struct SlotMatch {
  pub name: String,
  pub id: String,
  pub class: String,
  pub children: Markup,
}

impl Render for SlotMatch {
  fn render(&self) -> Markup {
    html! {
      slot-match #{(self.id)} name=(self.name) class=(self.class) {
        template shadowroot="open" {
          slot #slot {}
        }
        (self.children)
      }
    }
  }
}

struct SideNav {
  children: Markup,
}

impl Render for SideNav {
  fn render(&self) -> Markup {
    html! {
      side-nav class="SideNav self" {
        template shadowroot="open" {
          style { "@import '/main.css';" }

          nav .SideNav.nav {
            button
              #toggle.SideNav.button
              type="button"
              tabindex="-1"
              aria-hidden="true" {
              (SlotMatch {
                name: "menu".to_string(),
                id: "icon".to_string(),
                class: "SideNav button-content".to_string(),
                children: html! {
                  svg
                    .SideNav.icon
                    viewBox="0 0 100 100"
                    slot="close"
                    aria-hidden="true" {
                    rect
                      height="20"
                      width="120"
                      transform="rotate(-45,50,50)"
                      x="-10"
                      y="40" {}
                    rect
                      height="20"
                      width="120"
                      transform="rotate(45,50,50)"
                      x="-10"
                      y="40" {}
                  }

                  svg
                    .SideNav.icon
                    viewBox="0 0 100 100"
                    slot="menu"
                    aria-hidden="true" {
                    rect x="0" y="0" height="20" width="100" {}
                    rect x="0" y="40" height="20" width="100" {}
                    rect x="0" y="80" height="20" width="100" {}
                  }
                }
              })
            }
            .SideNav.triangle {}
            .SideNav.links {
              slot name="links" {}
            }
          }

          .SideNav.panel {
            slot name="panel" {}
          }
        }

        (self.children)
      }
    }
  }
}

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
          script type="module" src="/main.js" {}
          link href="/main.css" rel="stylesheet";
          link href="/favicon.svg" rel="icon" type="image/svg+xml";
          title { (self.title) " | " (self.content.title) }
        }
        body {
          (SideNav {
            children: html! {
              ol .Links.self slot="links" {
                @for link in self.content.to_owned().links {
                  li { a .Links.link href=(link.href) { (link.title) } }
                }
              }

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
            }
          })
          script src="/polyfill.js" {}
        }
      }
    }
  }
}

pub fn not_found() -> Result<String, CustomError> {
  let title = "Page Not Found";

  let content = models::Site::read();

  html_response(Layout {
    content: content.to_owned(),
    title: title.to_string(),
    children: html! {
      h1 .Content.heading { (title) }
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
      h1 .Content.heading { (title) }
      p .Content.paragraph { "An error occurred. Please try again later." }
    },
    heading: None,
  })
}

pub struct Post {
  pub post: Option<models::Post>,
}

impl Render for Post {
  fn render(&self) -> Markup {
    match self.post.to_owned() {
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
                width="84"
                height="59"
                x="8"
                y="33" {}
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
