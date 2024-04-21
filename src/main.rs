mod args;
mod error;
mod layers;
mod models;
mod routes;
mod templates;

use anyhow::Result;
use args::Args;
use axum::{http::Request, middleware::from_fn, response::Response, routing::get, serve, Router};
use clap::Parser;
use error::Error;
use layers::cache::cache_layer;
use routes::{asset::asset_handler, entry::entry_handler, list::list_handler, rss::rss_handler};
use std::{fs, sync::Arc, time::Duration};
use tokio::net::TcpListener;
use tower_http::{
	classify::ServerErrorsFailureClass, compression::CompressionLayer, trace::TraceLayer,
};

#[tokio::main]
async fn main() -> Result<()> {
	fs::remove_dir_all("storage").ok();
	fs::create_dir_all("storage")?;

	let args = Args::parse();
	let port = args.listen;

	tracing_subscriber::fmt()
		.compact()
		.with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
		.init();

	let templates = templates::Engine::new();
	let templates = Arc::new(templates);
	let mut app = Router::new()
		.route("/", get(list_handler))
		.route("/posts/:slug/", get(entry_handler))
		.route("/posts.rss", get(rss_handler))
		.fallback(asset_handler);

	if !args.no_cache {
		app = app.layer(from_fn(cache_layer));
	}

	let app = app
		.layer(CompressionLayer::new())
		.layer(
			TraceLayer::new_for_http()
				.make_span_with(|request: &Request<_>| {
					tracing::info_span!(
						"main",
						status = tracing::field::Empty,
						method = ?request.method(),
						uri = ?request.uri()
					)
				})
				.on_response(
					|response: &Response<_>, latency: Duration, span: &tracing::Span| {
						span.record("status", response.status().as_u16());
						tracing::info!("response in {latency:?}")
					},
				)
				.on_failure(
					|error: ServerErrorsFailureClass, _latency: Duration, _span: &tracing::Span| {
						tracing::error!("{error}")
					},
				),
		)
		.with_state(templates);
	let listener = TcpListener::bind(("0.0.0.0", port))
		.await
		.expect("should listen");

	serve(listener, app.into_make_service())
		.await
		.expect("server should start");

	tracing::debug!("listening on port {port}");

	Ok(())
}
