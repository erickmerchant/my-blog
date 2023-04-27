mod error;
mod routes;
mod state;

use app::{models, templates};
use axum::{
    http::header, http::Request, middleware::from_fn, middleware::Next, response::IntoResponse,
    response::Response, routing::get, Router,
};
use error::AppError;
use sea_orm::{Database, DatabaseConnection};
use serde_json::from_slice;
use state::{AppState, Site};
use std::time::Duration;
use std::{fs, io, net::SocketAddr, sync::Arc};
use tower_http::{
    classify::ServerErrorsFailureClass, compression::CompressionLayer, trace::TraceLayer,
};
use tracing::{field::Empty, info_span, Span};
use tracing_subscriber::EnvFilter;

pub async fn set_content_security_policy<B>(req: Request<B>, next: Next<B>) -> impl IntoResponse {
    let mut response = next.run(req).await;
    let headers = response.headers_mut();
    headers.insert(
        header::CONTENT_SECURITY_POLICY,
        header::HeaderValue::from_str("default-src 'self'")
            .expect("content security policy str should be valid header value"),
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
        .expect("database should connect");
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
                        status = Empty,
                        method = ?request.method(),
                        uri = ?request.uri()
                    )
                })
                .on_response(|response: &Response<_>, latency: Duration, span: &Span| {
                    span.record("status", response.status().as_u16());

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
        .expect("server should start");

    tracing::debug!("listening on {}", addr);

    Ok(())
}
