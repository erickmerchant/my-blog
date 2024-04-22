mod args;
mod error;
mod layers;
mod models;
mod routes;
mod templates;

use anyhow::Result;
use args::Args;
use axum::{middleware::from_fn, routing::get, serve, Router};
use clap::Parser;
use error::Error;
use layers::cache::cache_layer;
use routes::{asset::asset_handler, entry::entry_handler, list::list_handler, rss::rss_handler};
use std::{fs, sync::Arc};
use tokio::net::TcpListener;
use tower_http::{compression::CompressionLayer, trace::TraceLayer};

#[tokio::main]
async fn main() -> Result<()> {
	fs::remove_dir_all("storage").ok();

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
		.layer(TraceLayer::new_for_http())
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
