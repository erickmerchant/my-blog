use crate::common::{html_response, CustomError};
use crate::models::*;
use crate::views::SlotMatch;
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

pub fn page_layout(title: &str, children: Markup) -> Result<String, CustomError> {
  let content = Site::read();

  html_response(html! {
    (DOCTYPE)
    html lang="en-US" {
      head {
        meta charset="utf-8";
        meta name="viewport" content="width=device-width, initial-scale=1";
        script type="module" src="/main.js" {}
        script type="module" src="/minefield/main.js" {}
        link href="/minefield/main.css" rel="stylesheet";
        link href="/minefield/favicon.svg" rel="icon" type="image/svg+xml";
        title { (title) " | " (content.title) }
      }
      body {
        (children)
        script src="/polyfill.js" {}
      }
    }
  })
}
