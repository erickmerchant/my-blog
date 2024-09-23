mod error;
pub mod filters;
mod layers;
mod models;
mod routes;

use anyhow::Result;
use axum::{middleware::from_fn, routing::get, serve, Router};
use error::Error;
use layers::cache::layer as cache_layer;
use routes::{asset, entry, home, resume, rss};
use std::env;
use tokio::{fs, net::TcpListener};
use tower_http::{compression::CompressionLayer, trace::TraceLayer};

#[tokio::main]
async fn main() -> Result<()> {
	fs::remove_dir_all("storage").await.ok();

	let port: u16 = if let Ok(Ok(p)) = env::var("PORT").map(|p| p.parse()) {
		p
	} else {
		8080
	};

	tracing_subscriber::fmt()
		.compact()
		.with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
		.init();

	let app = Router::new()
		.route("/", get(home::handler))
		.route("/resume/", get(resume::handler))
		.route("/posts/:slug/", get(entry::handler))
		.route("/posts.rss", get(rss::handler))
		.route("/*path", get(asset::handler))
		.layer(from_fn(cache_layer))
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
