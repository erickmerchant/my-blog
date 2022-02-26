use maud::{html, Markup, DOCTYPE};

pub fn slot_match(name: &str, class_name: &str, content: Markup) -> Markup {
  html! {
    slot-match class=(class_name) name=(name) {
      template shadowroot="open" {
        slot {}
      }
      (content)
    }
  }
}

pub fn side_nav(content: Markup) -> Markup {
  html! {
    side-nav .Page.self {
      template shadowroot="open" {
        style { "@import '/main.css';" }

        nav .Nav.self {
          button .Nav.button type="button" aria-hidden="true" tabindex="-1" {
            (slot_match("menu", "", html! {
              svg
                .Nav.icon
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                slot="close"
              {
                rect height="20" width="120" transform="rotate(-45,50,50)" x="-10" y="40" {}
                rect height="20" width="120" transform="rotate(45,50,50)" x="-10" y="40" {}
              }

              svg
                .Nav.icon
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                slot="menu"
              {
                rect x="0" y="0" height="20" width="100" {}
                rect x="0" y="40" height="20" width="100" {}
                rect x="0" y="80" height="20" width="100" {}
              }
            }))
          }
          .Nav.triangle {}
          .Nav.links {
            slot name="links" {}
          }
        }

        .Panel.self {
          slot name="panel" {}
        }
      }

      (content)
    }
  }
}

pub fn page_layout(title: &str, content: Markup, heading: Option<Markup>) -> Markup {
  html! {
    (DOCTYPE)
    html lang="en-US" {
      head {
        meta charset="utf-8";
        meta name="viewport" content="width=device-width, initial-scale=1";
        meta name="description" content="The personal site of Erick Merchant.";
        script type="module" src="/main.js" {}
        link href="/main.css" rel="stylesheet";
        link href="/favicon.svg" rel="icon" type="image/svg+xml";
        title { (title) " | ErickMerchant.com" }
      }
      body {
        (side_nav(
          html! {
            ol .Links.self slot="links" {
              li { a .Links.link href="/" { "Home" } }
              li { a .Links.link href="https://github.com/erickmerchant/my-blog" { "View Source" } }
            }

            header .Banner.self slot="panel" {
              @if let Some(heading) = heading {
                (heading)
              } @else {
                .Banner.heading { "ErickMerchant.com" }
              }
            }

            main .Content.self slot="panel" {
              (content)
            }

            footer .Footer.self slot="panel" { p .Footer.copyright { "© 2022 Erick Merchant" } }
          }
        ))
        script src="/polyfill.js" {}
      }
    }
  }
}

pub fn not_found() -> Markup {
  let title = "Page Not Found";

  page_layout(
    title,
    html! {
      h1 .Content.heading { (title) }
      p .Content.paragraph { "That resource was moved, removed, or never existed." }
    },
    None,
  )
}

pub fn internal_error() -> Markup {
  let title = "Internal Error";

  page_layout(
    title,
    html! {
      h1 .Content.heading { (title) }
      p .Content.paragraph { "An error occurred. Please try again later." }
    },
    None,
  )
}
