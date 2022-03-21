mod blog;
pub mod models;

use crate::assets;
use actix_web::web;
pub use blog::views;

pub fn configure(cfg: &mut web::ServiceConfig) {
  cfg.service(
    web::scope("")
      .route("/", web::get().to(blog::home))
      .route("/feed.rss", web::get().to(blog::feed_rss))
      .route("/posts/{post:.*.html}", web::get().to(blog::post))
      .route("/{file:.*?}", web::get().to(assets::file)),
  );
}
