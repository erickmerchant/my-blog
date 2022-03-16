mod blog;
mod minefield;

use crate::assets;
use actix_web::web;
pub use blog::models;
pub use blog::views;

pub fn configure(cfg: &mut web::ServiceConfig) {
  cfg.service(
    web::scope("")
      .route("/", web::get().to(blog::home))
      .route("/feed.rss", web::get().to(blog::feed_rss))
      .route("/posts/{post:.*.html}", web::get().to(blog::post))
      .route("/minefield/start.html", web::get().to(minefield::start))
      .route(
        "/minefield/{width}/{height}/{count}.html",
        web::get().to(minefield::board),
      )
      .route("/{file:.*?}", web::get().to(assets::file)),
  );
}
