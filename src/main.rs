mod error;
mod filesystem;
pub mod filters;
mod layers;
mod models;
mod routes;
mod state;

use anyhow::Result;
use axum::{middleware::from_fn_with_state, routing::get, serve, Router};
use error::Error;
use filesystem::FileSystem;
use layers::cache::layer as cache_layer;
use routes::{asset, home, post, resume, rss};
use state::State;
use std::{env, sync::Arc};
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

	let state = State {
		public: FileSystem {
			directory: "public".to_string(),
		},
		content: FileSystem {
			directory: "content".to_string(),
		},
		storage: FileSystem {
			directory: "storage".to_string(),
		},
	};

	let app = app(state);
	let listener = TcpListener::bind(("0.0.0.0", port))
		.await
		.expect("should listen");

	tracing::debug!("listening on port {port}");

	serve(listener, app.into_make_service())
		.await
		.expect("server should start");

	Ok(())
}

fn app(state: State) -> Router {
	let state = Arc::new(state);

	Router::new()
		.route("/", get(home::handler))
		.route("/resume/", get(resume::handler))
		.route("/posts/:slug/", get(post::handler))
		.route("/posts.rss", get(rss::handler))
		.route("/*path", get(asset::handler))
		.with_state(state.clone())
		.layer(from_fn_with_state(state.clone(), cache_layer))
		.layer(CompressionLayer::new())
		.layer(TraceLayer::new_for_http())
}
