use crate::{assets, minefield, pages};
use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
  cfg.service(
    web::scope("")
      .route("/", web::get().to(pages::home))
      .route("/feed.rss", web::get().to(pages::feed))
      .route("/post/{post:.*.html}", web::get().to(pages::post))
      .route("/minefield/start.html", web::get().to(minefield::start))
      .route(
        "/minefield/{width}/{height}/{count}.html",
        web::get().to(minefield::board),
      )
      .route("/{file:.*?}", web::get().to(assets::file)),
  );
}
