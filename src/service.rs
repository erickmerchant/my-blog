mod assets;
mod common;
mod pages;

use actix_web::{
  http::StatusCode,
  middleware::{Compress, ErrorHandlers, Logger},
  web,
};

use handlebars::Handlebars;

pub fn configure(cfg: &mut web::ServiceConfig) {
  let mut handlebars = Handlebars::new();
  handlebars
    .register_templates_directory(".hbs", "./templates")
    .expect("Templates");
  let handlebars_ref = web::Data::new(handlebars);

  cfg.service(
    web::scope("")
      .wrap(Logger::new("%s %r"))
      .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, pages::not_found))
      .wrap(ErrorHandlers::new().handler(StatusCode::INTERNAL_SERVER_ERROR, pages::internal_error))
      .wrap(Compress::default())
      .app_data(handlebars_ref.clone())
      .route("/", web::get().to(pages::index))
      .route("/{file:.*.html}", web::get().to(pages::page))
      .route("/{file:.*?}", web::get().to(assets::file)),
  );
}
