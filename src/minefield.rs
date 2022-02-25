use crate::common::{cacheable_response, dynamic_response, minify_markup};
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

fn page_layout(title: &str, content: Markup) -> Markup {
  html! {
    (DOCTYPE)
    html lang="en-US" {
      head {
        meta charset="utf-8";
        meta name="viewport" content="width=device-width, initial-scale=1";
        meta name="description" content="The personal site of Erick Merchant.";
        script type="module" src="/minefield/game.js" {}
        link href="/minefield/styles.css" rel="stylesheet";
        link href="/favicon.svg" rel="icon" type="image/svg+xml";
        title { (title) " | ErickMerchant.com" }
      }
      body {
        (content)
        script src="/polyfill.js" {}
      }
    }
  }
}

pub async fn start() -> Result<NamedFile> {
  cacheable_response(Path::new("minefield/start.html"), || {
    minify_markup(page_layout(
      "Minefield",
      html! {
        main .App.self {
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
      },
    ))
  })
}

pub async fn board(dimensions: web::Path<(usize, usize, usize)>) -> Result<HttpResponse> {
  let (width, height, count) = dimensions.as_ref();
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
    if let Some(tile) = tiles.get_mut(i) {
      let column = i % width;
      let row = i / width;

      tile.column = column;
      tile.row = row;

      if tile.mine {
        let mut steps = vec![];

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

        for step in steps {
          if let Some(tile) = tiles.get_mut(step) {
            tile.neighbors = tile.neighbors + 1;
          }
        }
      }
    }
  }

  dynamic_response(|| {
    minify_markup(page_layout(
      "Minefield",
      html! {
        minefield-game .App.self style={ "--width: " (width) "; --height: " (height) ";" } {
          template shadowroot="open" {
            style { "@import '/minefield/styles.css';" }

            .Stats.self {
              .Stats.stat {
                span { "🚩" }
                (count)
              }
              .Stats.stat {
                minefield-time { "0" }
                span { "⏱" }
              }
            }

            .Field.self {
              slot {}
            }
          }

          @for tile in &tiles {
            minefield-tile .Field.tile row={(tile.row)} column={(tile.column)} {
              template shadowroot="open" {
                style { "@import '/minefield/styles.css';" }

                button .Field.button.shown type="button" style={"color: var(--color-" (tile.neighbors) ");"} {
                  slot name="shown" {}
                }
              }

              div slot="hidden" {}

              @if tile.mine {
                div slot="shown" { "💥" }
              } @else if tile.neighbors > 0 {
                div slot="shown" { (tile.neighbors ) }
              }
            }
          }
        }
      },
    ))
  })
}
