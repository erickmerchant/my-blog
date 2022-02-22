use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
  cfg.service(
    web::scope("")
      .route("/", web::get().to(crate::pages::home))
      .route("/feed.rss", web::get().to(crate::pages::feed))
      .route("/post/{post:.*.html}", web::get().to(crate::pages::post))
      .route("/{file:.*?}", web::get().to(crate::assets::file)),
  );
}
