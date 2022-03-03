use crate::common::{cacheable_response, dynamic_response, html_response, CustomError};
use crate::content::get_site_content;
use crate::templates::slot_match;
use actix_files::NamedFile;
use actix_web::{web, HttpResponse, Result};
use maud::{html, Markup, DOCTYPE};
use rand::{seq::SliceRandom, thread_rng};
use serde::{Deserialize, Serialize};
use std::{path::Path, vec};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Tile {
  mine: bool,
  neighbors: usize,
  row: usize,
  column: usize,
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
          div .App.display {
            h1 .App.heading {
              span { "💥" }
              "Minefield"
            }
            p { "Choose your level:" }
            ol .Nav.self {
              li .Nav.item {
                span { "🚩" }
                a .Nav.link href="/minefield/8/8/10.html" { "Novice" }
              }
              li .Nav.item {
                span { "🚩" }
                a .Nav.link href="/minefield/16/16/40.html" { "Intermediate" }
              }
              li .Nav.item {
                span { "🚩" }
                a .Nav.link href="/minefield/30/16/99.html" { "Pro" }
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
      Tile {
        mine: true,
        neighbors: 0,
        row: 0,
        column: 0,
      };
      count.to_owned()
    ],
    vec![
      Tile {
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
                  minefield-flags count=(count) {
                    template shadowroot="open" {
                      (count)
                    }
                  }
                }
                .Stats.stat {
                  minefield-time {
                    template shadowroot="open" {
                      "0"
                    }
                  }
                  "⏱"
                }
              }

              .Field.self {
                @for tile in &tiles {
                  minefield-tile .Field.tile row=(tile.row) column=(tile.column) empty[!tile.mine && tile.neighbors == 0] mine[tile.mine] hidden {
                    template shadowroot="open" {
                      style {
                        "@import '/minefield.css';"

                        ":host {"
                          "color: var(--color-" (tile.neighbors) ");"
                        "}"
                      }

                      (slot_match(
                        "hidden",
                        "switch",
                        "Field tile-content",
                        html! {
                          button .Field.hidden type="button" slot="hidden" id="reveal-button" aria-label={"row " (tile.row) " column " (tile.column)} {}

                          .Field.shown slot="shown" {
                            slot {}
                          }

                          .Field.shown slot="disarmed" {
                            "💣"
                          }
                        }
                      ))
                    }

                    @if tile.mine {
                      "💥"
                    } @else if tile.neighbors > 0 {
                      (tile.neighbors)
                    }
                  }
                }
              }
            }

            minefield-dialog .Message.self {
              template shadowroot="open" {
                style { "@import '/minefield.css';" }

                (slot_match(
                  "closed",
                  "switch",
                  "Message content",
                  html! {
                    dialog .Message.dialog slot="mulligan" {
                      span { "😅 Phew! That was close." }
                      button .Message.button id="mulligan-ok" { "OK" }
                    }
                    dialog .Message.dialog slot="loss" {
                      span { "🙁 You lost. Try again?" }
                      button .Message.button id="loss-ok" { "OK" }
                      button .Message.button id="loss-cancel" { "Cancel" }
                    }
                    dialog .Message.dialog slot="win" {
                      span { "🙂 You won! Start new game?" }
                      button .Message.button id="win-ok" { "OK" }
                      button .Message.button id="win-cancel" { "Cancel" }
                    }
                  }
                ))
              }
            }
          }
        }
      },
    )
  })
}
