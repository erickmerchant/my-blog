mod models;
mod routes;
mod templates;

use axum::{
    http::header, http::Request, http::StatusCode, middleware::from_fn, middleware::Next,
    response::IntoResponse, response::Response, routing::get, Router,
};
use sea_orm::{Database, DatabaseConnection};
use serde::{Deserialize, Serialize};
use serde_json::from_slice;
use std::time::Duration;
use std::{fs, io, net::SocketAddr, sync::Arc};
use tower_http::{
    classify::ServerErrorsFailureClass, compression::CompressionLayer, trace::TraceLayer,
};
use tracing::{info_span, Span};
use tracing_subscriber::EnvFilter;

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

pub async fn set_content_security_policy<B>(req: Request<B>, next: Next<B>) -> impl IntoResponse {
    let mut response = next.run(req).await;
    let headers = response.headers_mut();
    headers.insert(
        header::CONTENT_SECURITY_POLICY,
        header::HeaderValue::from_str("default-src 'self'").unwrap(),
    );
    response
}

#[tokio::main]
async fn main() -> io::Result<()> {
    tracing_subscriber::fmt()
        .compact()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

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
        .route("/theme/*file", get(routes::asset))
        .layer(from_fn(set_content_security_policy))
        .layer(CompressionLayer::new())
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(|request: &Request<_>| {
                    info_span!(
                        "main",
                        method = ?request.method(),
                        uri = ?request.uri(),
                    )
                })
                .on_response(|_response: &Response<_>, latency: Duration, _span: &Span| {
                    tracing::info!("response in {latency:?}")
                })
                .on_failure(
                    |error: ServerErrorsFailureClass, _latency: Duration, _span: &Span| {
                        tracing::error!("{error}")
                    },
                ),
        );

    let app = app.with_state(app_state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    tracing::debug!("listening on {}", addr);

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
