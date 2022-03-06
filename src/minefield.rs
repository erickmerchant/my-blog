use crate::common::{cacheable_response, dynamic_response, html_response, CustomError};
use crate::content::get_site_content;
use crate::templates::SlotMatch;
use actix_files::NamedFile;
use actix_web::{web, HttpResponse, Result};
use maud::{html, Markup, Render, DOCTYPE};
use rand::{seq::SliceRandom, thread_rng};
use serde::{Deserialize, Serialize};
use std::{path::Path, vec};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct MinefieldTile {
  mine: bool,
  neighbors: usize,
  row: usize,
  column: usize,
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
            "@import '/minefield.css';

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

struct MinefieldDialog {
  slot: String,
  message: String,
  close_text: String,
  confirm_text: Option<String>,
  has_timeout: bool,
}

impl Render for MinefieldDialog {
  fn render(&self) -> Markup {
    html! {
      minefield-dialog
        .MinefieldDialog.self
        has-timeout[(self.has_timeout)]
        slot=(self.slot) {
        template shadowroot="open" {
          style { "@import '/minefield.css';" }
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

fn page_layout(title: &str, children: Markup) -> Result<String, CustomError> {
  let content = get_site_content();

  html_response(html! {
    (DOCTYPE)
    html lang="en-US" {
      head {
        meta charset="utf-8";
        meta name="viewport" content="width=device-width, initial-scale=1";
        script type="module" src="/main.js" {}
        script type="module" src="/minefield.js" {}
        link href="/minefield.css" rel="stylesheet";
        link href="/favicon.svg" rel="icon" type="image/svg+xml";
        title { (title) " | " (content.title) }
      }
      body {
        (children)
        script src="/polyfill.js" {}
      }
    }
  })
}

pub async fn start() -> Result<NamedFile> {
  cacheable_response(Path::new("minefield/start.html"), || {
    page_layout(
      "Minefield",
      html! {
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
    )
  })
}

pub async fn board(
  dimensions: web::Path<(usize, usize, usize)>,
) -> Result<HttpResponse, CustomError> {
  let (width, height, count) = dimensions.as_ref();

  if width > &(30 as usize) || height > &(30 as usize) || count > &(99 as usize) {
    return Err(CustomError::Internal {
      message: "invalid request".to_string(),
    });
  }

  let size = width * height;

  let mut tiles = vec![
    vec![
      MinefieldTile {
        mine: true,
        neighbors: 0,
        row: 0,
        column: 0,
      };
      count.to_owned()
    ],
    vec![
      MinefieldTile {
        mine: false,
        neighbors: 0,
        row: 0,
        column: 0,
      };
      (size - count).to_owned()
    ],
  ]
  .concat();

  tiles.shuffle(&mut thread_rng());

  for i in 0..size {
    let column = i % width;
    let row = i / width;
    let mut steps = vec![];
    let mut modify = false;

    if let Some(tile) = tiles.get_mut(i) {
      tile.column = column;
      tile.row = row;
    }

    if let Some(tile) = tiles.get(i) {
      if tile.mine {
        modify = true;

        if row > 0 {
          if column > 0 {
            steps.push(i - width - 1);
          }

          steps.push(i - width);

          if column < width - 1 {
            steps.push(i - width + 1);
          }
        }

        if column > 0 {
          steps.push(i - 1);
        }

        if column < width - 1 {
          steps.push(i + 1);
        }

        if row < width - 1 {
          if column > 0 {
            steps.push(i + width - 1);
          }

          steps.push(i + width);

          if column < width - 1 {
            steps.push(i + width + 1);
          }
        }
      }
    }

    if modify {
      for step in steps {
        if let Some(neighbor) = tiles.get_mut(step) {
          neighbor.neighbors = neighbor.neighbors + 1;
        }
      }
    }
  }

  dynamic_response(|| {
    page_layout(
      "Minefield",
      html! {
        @let remaining = height * width - count;

        minefield-game .App.self remaining=(remaining) {
          template shadowroot="open" {
            style {
              "@import '/minefield.css';

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
                  message: "🙁 You lost. Try again?".to_string(),
                  close_text: "Cancel".to_string(),
                  confirm_text: Some("OK".to_string()),
                  has_timeout: false
                })
                (MinefieldDialog {
                  slot: "win".to_string(),
                  message: "🙂 You won! Start new game?".to_string(),
                  close_text: "Cancel".to_string(),
                  confirm_text: Some("OK".to_string()),
                  has_timeout: false
                })
              }
            })
          }
        }
      },
    )
  })
}
