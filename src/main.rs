#[cfg(test)]
mod tests;

use anyhow::Result;
use app::{
	layers::html,
	routes::{asset, not_found, page},
	state,
};
use axum::{middleware::from_fn_with_state, routing::get, serve, Router};
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
	let public_path = state.args.base_dir.trim_end_matches("/").to_owned() + "/public";
	let public_path = public_path.trim_start_matches("./");
	let public_htmls = glob((public_path.to_owned() + "/**/*.html").as_str()).ok();

	if let Some(paths) = public_htmls {
		for path in paths.flatten() {
			if let Some(p) = path.to_str() {
				let p = p
					.trim_start_matches(public_path)
					.trim_end_matches("index.html");

				router = router.route(p, get(page::page_handler));
			}
		}
	}

	router
		.route_layer(from_fn_with_state(state.clone(), html::html_layer))
		.route("/{*path}", get(asset::asset_handler))
		.fallback(not_found::not_found_handler)
		.with_state(state.clone())
		.layer(CompressionLayer::new())
		.layer(TraceLayer::new_for_http())
}
