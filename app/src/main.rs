mod models;
mod routes;
mod templates;

use axum::{http::StatusCode, response::IntoResponse, response::Response, routing::get, Router};
use sea_orm::{Database, DatabaseConnection};
use serde::{Deserialize, Serialize};
use serde_json::from_slice;
use std::{fs, io, net::SocketAddr, sync::Arc};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Link {
    title: String,
    href: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Site {
    title: String,
    base: String,
    author: String,
    links: Vec<Link>,
}

#[derive(Debug, Clone)]
pub struct AppState {
    pub templates: minijinja::Environment<'static>,
    pub database: sea_orm::DatabaseConnection,
    pub site: Site,
}

/*
    @todo
    - logging
    - compression
    - "Content-Security-Policy", "default-src 'self'"
    - static files
*/
#[tokio::main]
async fn main() -> io::Result<()> {
    let port = envmnt::get_u16("PORT", 8080);

    let templates = templates::get_env();
    let database: DatabaseConnection = Database::connect("sqlite://./storage/content.db")
        .await
        .unwrap();
    let site = fs::read("./content/site.json")?;
    let site = from_slice::<Site>(&site)?;
    let app_state = Arc::new(AppState {
        templates,
        database,
        site,
    });

    let app = Router::new()
        .route("/", get(routes::posts_index))
        .route("/:category", get(routes::index))
        .route("/:category/:slug", get(routes::page))
        .route("/theme/*file", get(routes::asset));

    let app = app.with_state(app_state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    Ok(())
}

pub struct AppError(anyhow::Error);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (StatusCode::INTERNAL_SERVER_ERROR, format!("{}", self.0)).into_response()
    }
}

impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}
