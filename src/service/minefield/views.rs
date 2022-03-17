use super::super::{models, views::SlotMatch};
use crate::common::{html_response, CustomError};
use actix_web::Result;
use maud::{html, Markup, Render, DOCTYPE};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MinefieldTile {
  pub mine: bool,
  pub neighbors: usize,
  pub row: usize,
  pub column: usize,
}

impl Render for MinefieldTile {
  fn render(&self) -> Markup {
    html! {
      minefield-tile
        .MinefieldTile.self
        row=(self.row)
        column=(self.column)
        empty[!self.mine && self.neighbors == 0]
        mine[self.mine]
        hidden {
        template shadowroot="open" {
          style {
            "@import '/minefield/main.css';

            :host {
              color: var(--color-" (self.neighbors) ");
            }"
          }

          (SlotMatch {
            name: "hidden".to_string(),
            id: "switch".to_string(),
            class: "MinefieldTile content".to_string(),
            children: html! {
              button
                #reveal-button.MinefieldTile.hidden
                type="button"
                slot="hidden"
                aria-label={"row " (self.row) " column " (self.column)} {}

              .MinefieldTile.shown slot="shown" {
                slot {}
              }

              .MinefieldTile.shown slot="disarmed" {
                "💣"
              }
            }
          })
        }

        @if self.mine {
          "💥"
        } @else if self.neighbors > 0 {
          (self.neighbors)
        }
      }
    }
  }
}

pub struct MinefieldDialog {
  pub slot: String,
  pub message: String,
  pub close_text: String,
  pub confirm_text: Option<String>,
  pub has_timeout: bool,
}

impl Render for MinefieldDialog {
  fn render(&self) -> Markup {
    html! {
      minefield-dialog
        .MinefieldDialog.self
        has-timeout[(self.has_timeout)]
        slot=(self.slot) {
        template shadowroot="open" {
          style { "@import '/minefield/main.css';" }
          dialog #dialog.MinefieldDialog.dialog {
            span { (self.message) }
            @if let Some(confirm_text) = &self.confirm_text {
              button #submit.MinefieldDialog.button type="button" {
                (confirm_text)
              }
            }
            button #cancel.MinefieldDialog.button type="button" {
              (self.close_text)
            }
          }
        }
      }
    }
  }
}

pub struct Layout {
  pub title: String,
  pub children: Markup,
}

impl Render for Layout {
  fn render(&self) -> Markup {
    let site = models::Site::read();

    html! {
      (DOCTYPE)
      html lang="en-US" {
        head {
          meta charset="utf-8";
          meta name="viewport" content="width=device-width, initial-scale=1";
          script type="module" src="/main.js" {}
          script type="module" src="/minefield/main.js" {}
          link href="/minefield/main.css" rel="stylesheet";
          link href="/minefield/favicon.svg" rel="icon" type="image/svg+xml";
          title { (self.title) " | " (site.title) }
        }
        body {
          (self.children)
          script src="/polyfill.js" {}
        }
      }
    }
  }
}

pub fn start_page() -> Result<String, CustomError> {
  html_response(Layout {
    title: "Minefield".to_string(),
    children: html! {
      main .App.self {
        .App.display {
          h1 .App.heading {
            span { "💥" }
            "Minefield"
          }
          p { "Choose your level:" }
          ol .Nav.self {
            li .Nav.item {
              span { "🚩" }
              a .Nav.link href="/minefield/8/8/10.html" {
                "Novice"
              }
            }
            li .Nav.item {
              span { "🚩" }
              a .Nav.link href="/minefield/16/16/40.html" {
                "Intermediate"
              }
            }
            li .Nav.item {
              span { "🚩" }
              a .Nav.link href="/minefield/30/16/99.html" {
                "Pro"
              }
            }
          }
        }
      }
    },
  })
}

pub fn board_page(
  dimensions: (usize, usize, usize),
  tiles: Vec<MinefieldTile>,
) -> Result<String, CustomError> {
  html_response(Layout {
    title: "Minefield".to_string(),
    children: html! {
      @let (width, height, count) = dimensions;

      @let remaining = height * width - count;

      minefield-game .App.self remaining=(remaining) {
        template shadowroot="open" {
          style {
            "@import '/minefield/main.css';

            :host {
              --width: " (width) ";
              --height: " (height) ";
            }"
          }

          .App.display {
            .Stats.self {
              .Stats.stat {
                "🚩"
                minefield-flags #flags count=(count) {
                  template shadowroot="open" {
                    (count)
                  }
                }
              }
              .Stats.stat {
                minefield-time #time {
                  template shadowroot="open" {
                    "0"
                  }
                }
                "⏱"
              }
            }

            .Tiles.self {
              @for tile in &tiles {
                (tile.to_owned())
              }
            }
          }

          (SlotMatch {
            name: "".to_string(),
            id: "dialog-switch".to_string(),
            class: "Message self".to_string(),
            children: html! {
              (MinefieldDialog {
                slot: "mulligan".to_string(),
                message: "😅 Phew! That was close.".to_string(),
                close_text: "OK".to_string(),
                confirm_text: None,
                has_timeout: true
              })
              (MinefieldDialog {
                slot: "loss".to_string(),
                message: "🙁 Sorry, you lost. Try again?".to_string(),
                close_text: "Cancel".to_string(),
                confirm_text: Some("OK".to_string()),
                has_timeout: false
              })
              (MinefieldDialog {
                slot: "win".to_string(),
                message: "🙂 You won! Start a new game?".to_string(),
                close_text: "Cancel".to_string(),
                confirm_text: Some("OK".to_string()),
                has_timeout: false
              })
            }
          })
        }
      }
    },
  })
}
