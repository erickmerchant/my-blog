use crate::common::{cacheable_response, dynamic_response, render_content};
use actix_files::NamedFile;
use actix_web::{web, HttpResponse, Result};
use handlebars::Handlebars;
use rand::{seq::SliceRandom, thread_rng};
use serde::{Deserialize, Serialize};
use std::{path::Path, vec};

pub async fn start(hb: web::Data<Handlebars<'_>>) -> Result<NamedFile> {
  cacheable_response(Path::new("minefield/start.html"), || {
    render_content(
      hb.clone(),
      Path::new("page/minefield/start.html"),
      &serde_json::json!({}),
    )
  })
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Tile {
  mine: bool,
  neighbors: u16,
}

pub async fn board(
  hb: web::Data<Handlebars<'_>>,
  dimensions: web::Path<(usize, usize, usize)>,
) -> Result<HttpResponse> {
  let (width, height, count) = dimensions.as_ref();
  let size = width * height;

  let mut tiles = [
    vec![
      Tile {
        mine: true,
        neighbors: 0
      };
      count.to_owned()
    ],
    vec![
      Tile {
        mine: false,
        neighbors: 0
      };
      (size - count).to_owned()
    ],
  ]
  .concat();

  tiles.shuffle(&mut thread_rng());

  for i in 0..size {
    if let Some(tile) = tiles.get(i) {
      if tile.mine {
        let column = i % width;
        let row = i / width;

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
    render_content(
      hb.clone(),
      Path::new("page/minefield/board.html"),
      &serde_json::json!({"width": width, "height": height, "count": count, "tiles": tiles}),
    )
  })
}
