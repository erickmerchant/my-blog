mod entities;
mod error_routes;
mod routes;
mod templates;

use actix_web::{
    http::StatusCode, middleware::Compress, middleware::DefaultHeaders, middleware::ErrorHandlers,
    middleware::Logger, web, App, HttpServer,
};
use sea_orm::{Database, DatabaseConnection};
use std::{env::var, io, io::Write};

#[derive(Debug, Clone)]
pub struct AppState {
    pub templates: minijinja::Environment<'static>,
    pub database: sea_orm::DatabaseConnection,
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::builder()
        .format(|buf, record| writeln!(buf, "[{}] {}", record.level(), record.args()))
        .init();

    let mut port = 8080;

    if let Ok(port_var) = var("PORT") {
        if let Ok(port_var) = port_var.parse::<u32>() {
            port = port_var;
        }
    };

    let templates = templates::get_env();
    let database: DatabaseConnection = Database::connect("sqlite://./storage/content.db")
        .await
        .unwrap();
    let app_state = AppState {
        templates,
        database,
    };

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(app_state.clone()))
            .wrap(Logger::new("%s %r"))
            .wrap(DefaultHeaders::new().add(("Content-Security-Policy", "default-src 'self'")))
            .wrap(ErrorHandlers::new().handler(StatusCode::NOT_FOUND, error_routes::not_found))
            .wrap(ErrorHandlers::new().handler(
                StatusCode::INTERNAL_SERVER_ERROR,
                error_routes::internal_error,
            ))
            .wrap(Compress::default())
            .route("/", web::get().to(routes::posts_index))
            .route("/posts.rss", web::get().to(routes::posts_rss))
            .route("/{category:.*?}/{slug}.html", web::get().to(routes::page))
            .route("/{file:.*?}.js", web::get().to(routes::js))
            .route("/{file:.*?}.css", web::get().to(routes::css))
            .route("/{file:.*?}", web::get().to(routes::asset))
    })
    .bind(format!("0.0.0.0:{port}"))?
    .run()
    .await
}
