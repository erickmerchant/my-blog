#[cfg(test)]
mod tests;

use anyhow::Result;
use app::{routes::asset, state};
use axum::{serve, Router};
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::{compression::CompressionLayer, trace::TraceLayer};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> Result<()> {
	let state = state::State::from_env();

	tracing_subscriber::fmt()
		.with_env_filter(EnvFilter::try_from_default_env().unwrap_or_default())
		.init();

	let app = get_app(state.clone());
	let listener = TcpListener::bind(("0.0.0.0", state.args.port))
		.await
		.expect("should listen");

	serve(listener, app.into_make_service())
		.await
		.expect("server should start");

	Ok(())
}

fn get_app(state: state::State) -> Router {
	let state = Arc::new(state);

	Router::new()
		.fallback(asset::asset_handler)
		.with_state(state.clone())
		.layer(CompressionLayer::new())
		.layer(TraceLayer::new_for_http())
}
