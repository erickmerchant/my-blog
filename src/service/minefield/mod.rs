mod views;

use crate::common::{cacheable_response, dynamic_response, CustomError};
use actix_files::NamedFile;
use actix_web::{web, HttpResponse, Result};
use rand::{seq::SliceRandom, thread_rng};
use std::{path::Path, vec};

pub async fn start() -> Result<NamedFile> {
  cacheable_response(Path::new("minefield/start.html"), views::start_page)
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
      views::MinefieldTile {
        mine: true,
        neighbors: 0,
        row: 0,
        column: 0,
      };
      count.to_owned()
    ],
    vec![
      views::MinefieldTile {
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

  dynamic_response(|| views::board_page(dimensions.as_ref().to_owned(), tiles.to_owned()))
}
