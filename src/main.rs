mod config;
mod handlers {
    pub mod assets {
        pub mod asset;
        pub mod css;
        pub mod js;
    }
    pub mod errors {
        pub mod internal_error;
        pub mod not_found;
    }
    pub mod pages {
        pub mod home;
        pub mod page;
        pub mod post;
        pub mod posts_rss;
    }
}
mod models {
    pub mod page;
    pub mod post;
    pub mod site;
}
mod responses;
mod templates;

use crate::{handlers::*, models::site};
use actix_web::{
    http::StatusCode, middleware::Compress, middleware::DefaultHeaders, middleware::ErrorHandlers,
    middleware::Logger, web, App, HttpServer,
};
use std::{fs, io, io::Write};

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::builder()
        .format(|buf, record| writeln!(buf, "[{}] {}", record.level(), record.args()))
        .init();
    fs::remove_dir_all("storage/cache").ok();

    let config = config::Config::new();
    let port = config.port;

    let template_env = templates::get_env();

    HttpServer::new(move || {
        let site = site::Site::get();

        App::new()
            .app_data(web::Data::new(config.to_owned()))
            .app_data(web::Data::new(site))
            .app_data(web::Data::new(template_env.to_owned()))
            .wrap(Logger::new("%s %r"))
            .wrap(DefaultHeaders::new().add(("Content-Security-Policy", "default-src 'self'")))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, errors::not_found::handler))
            .wrap(ErrorHandlers::new().handler(
                StatusCode::INTERNAL_SERVER_ERROR,
                errors::internal_error::handler,
            ))
            .wrap(Compress::default())
            .route("/", web::get().to(pages::home::handler))
            .route("/posts.rss", web::get().to(pages::posts_rss::handler))
            .route(
                "/posts/{slug:.*?}.html",
                web::get().to(pages::post::handler),
            )
            .route("/{slug:.*?}.html", web::get().to(pages::page::handler))
            .route("{file:.*?}.js", web::get().to(assets::js::handler))
            .route("{file:.*?}.css", web::get().to(assets::css::handler))
            .route("{file:.*?}", web::get().to(assets::asset::handler))
    })
    .bind(format!("0.0.0.0:{port}"))?
    .run()
    .await
}
