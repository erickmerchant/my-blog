#[cfg(test)]
mod tests;

use anyhow::Result;
use app::{
	routes::{asset, page},
	state,
};
use axum::{routing::get, serve, Router};
use glob::glob;
use std::{fs, sync::Arc};
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
	fs::remove_dir_all(state.args.base_dir.trim_end_matches("/").to_string() + "/storage/cache/")
		.ok();

	let state = Arc::new(state);
	let mut router = Router::new();
	let dist_path = state.args.base_dir.trim_end_matches("/").to_owned() + "/dist";
	let dist_path = dist_path.trim_start_matches("./");
	let dist_htmls = glob((dist_path.to_owned() + "/**/*.html").as_str()).ok();

	if let Some(paths) = dist_htmls {
		for path in paths.flatten() {
			if let Some(p) = path.to_str() {
				let p = p
					.trim_start_matches(dist_path)
					.trim_end_matches("index.html");

				router = router.route(p, get(page::page_handler));
			}
		}
	}

	router
		.route("/{*path}", get(asset::asset_handler))
		.with_state(state.clone())
		.layer(CompressionLayer::new())
		.layer(TraceLayer::new_for_http())
}
