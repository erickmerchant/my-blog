use crate::common::{html_response, CustomError};
use crate::content::{get_site_content, Site};
use maud::{html, Markup, Render, DOCTYPE};

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
  class: String,
  children: Markup,
}

impl Render for SideNav {
  fn render(&self) -> Markup {
    html! {
      side-nav class=(self.class) {
        template shadowroot="open" {
          style { "@import '/main.css';" }

          nav .SideNav-Nav.self {
            button #toggle.SideNav-Nav.button type="button" aria-hidden="true" tabindex="-1" {
              (SlotMatch {
                name: "menu".to_string(),
                id: "icon".to_string(),
                class: "SideNav-Nav button-content".to_string(),
                children: html! {
                  svg
                    .SideNav-Nav.icon
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    slot="close"
                  {
                    rect height="20" width="120" transform="rotate(-45,50,50)" x="-10" y="40" {}
                    rect height="20" width="120" transform="rotate(45,50,50)" x="-10" y="40" {}
                  }

                  svg
                    .SideNav-Nav.icon
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    slot="menu"
                  {
                    rect x="0" y="0" height="20" width="100" {}
                    rect x="0" y="40" height="20" width="100" {}
                    rect x="0" y="80" height="20" width="100" {}
                  }
                }
              })
            }
            .SideNav-Nav.triangle {}
            .SideNav-Nav.links {
              slot name="links" {}
            }
          }

          .SideNav-Panel.self {
            slot name="panel" {}
          }
        }

        (self.children)
      }
    }
  }
}

pub fn page_layout(
  content: Site,
  title: &str,
  children: Markup,
  heading: Option<Markup>,
) -> Result<String, CustomError> {
  html_response(html! {
    (DOCTYPE)
    html lang="en-US" {
      head {
        meta charset="utf-8";
        meta name="viewport" content="width=device-width, initial-scale=1";
        meta name="description" content=(content.description);
        script type="module" src="/main.js" {}
        link href="/main.css" rel="stylesheet";
        link href="/favicon.svg" rel="icon" type="image/svg+xml";
        title { (title) " | " (content.title) }
      }
      body {
        (SideNav {
          class: "Page self".to_owned(),
          children: html! {
            ol .Links.self slot="links" {
              @for link in content.links {
                li { a .Links.link href=(link.href) { (link.title) } }
              }
            }

            header .Banner.self slot="panel" {
              @if let Some(heading) = heading {
                (heading)
              } @else {
                .Banner.heading { (content.title) }
              }
            }

            main .Content.self slot="panel" {
              (children)
            }

            footer .Footer.self slot="panel" { p .Footer.copyright { (content.copyright) } }
          }
        })
        script src="/polyfill.js" {}
      }
    }
  })
}

pub fn not_found() -> Result<String, CustomError> {
  let title = "Page Not Found";

  let content = get_site_content();

  page_layout(
    content.to_owned(),
    title,
    html! {
      h1 .Content.heading { (title) }
      p .Content.paragraph { "That resource was moved, removed, or never existed." }
    },
    None,
  )
}

pub fn internal_error() -> Result<String, CustomError> {
  let title = "Internal Error";

  let content = get_site_content();

  page_layout(
    content.to_owned(),
    title,
    html! {
      h1 .Content.heading { (title) }
      p .Content.paragraph { "An error occurred. Please try again later." }
    },
    None,
  )
}
