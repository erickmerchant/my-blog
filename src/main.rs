mod error;
mod filters;
mod layers;
mod models;
mod routes;

use anyhow::Result;
use axum::{middleware::from_fn, routing::get, serve, Router};
use error::Error;
use layers::cache;
use routes::{asset, entry, list, rss};
use std::env;
use std::fs;
use tokio::net::TcpListener;
use tower_http::{compression::CompressionLayer, trace::TraceLayer};

#[tokio::main]
async fn main() -> Result<()> {
	fs::remove_dir_all("storage").ok();

	let port: u16 = if let Ok(Ok(p)) = env::var("PORT").map(|p| p.parse::<u16>()) {
		p
	} else {
		8080
	};

	tracing_subscriber::fmt()
		.compact()
		.with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
		.init();

	let app = Router::new()
		.route("/", get(list::handler))
		.route("/posts/:slug/", get(entry::handler))
		.route("/posts.rss", get(rss::handler))
		.route_layer(from_fn(cache::layer))
		.fallback(asset::handler)
		.layer(CompressionLayer::new())
		.layer(TraceLayer::new_for_http());
	let listener = TcpListener::bind(("0.0.0.0", port))
		.await
		.expect("should listen");

	tracing::debug!("listening on port {port}");

	serve(listener, app.into_make_service())
		.await
		.expect("server should start");

	Ok(())
}
