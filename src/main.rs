mod assets;
mod config;
mod errors;
mod models;
mod pages;
mod responses;

use actix_web::{
    http::StatusCode, middleware::Compress, middleware::DefaultHeaders, middleware::ErrorHandlers,
    middleware::Logger, web, App, HttpServer,
};
use minijinja::{Environment, Source};
use std::{fs, io, io::Write};

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::builder()
        .format(|buf, record| writeln!(buf, "[{}] {}", record.level(), record.args()))
        .init();
    fs::remove_dir_all("storage/cache").ok();

    let config = config::Config::new();
    let port = config.port;

    let mut template_env = Environment::new();
    template_env.set_source(Source::from_path("templates"));

    fn date(value: String, fmt: String) -> String {
        let mut ret = value.clone();

        if let Ok(parsed) = chrono::NaiveDate::parse_from_str(&value, "%Y-%m-%d") {
            ret = parsed.format(&fmt).to_string();
        }

        ret
    }

    template_env.add_filter("date", date);

    HttpServer::new(move || {
        let site = models::Site::get();

        App::new()
            .app_data(web::Data::new(config.to_owned()))
            .app_data(web::Data::new(site))
            .app_data(web::Data::new(template_env.to_owned()))
            .wrap(Logger::new("%s %r"))
            .wrap(DefaultHeaders::new().add(("Content-Security-Policy", "default-src 'self'")))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, errors::not_found))
            .wrap(
                ErrorHandlers::new()
                    .handler(StatusCode::INTERNAL_SERVER_ERROR, errors::internal_error),
            )
            .wrap(Compress::default())
            .route("/", web::get().to(pages::home))
            .route("/posts.rss", web::get().to(pages::posts_rss))
            .route("/posts/{slug:.*?}.html", web::get().to(pages::post))
            .route("{file:.*?}.js", web::get().to(assets::js))
            .route("{file:.*?}.css", web::get().to(assets::css))
            .route("{file:.*?}", web::get().to(assets::asset))
    })
    .bind(format!("0.0.0.0:{port}"))?
    .run()
    .await
}
