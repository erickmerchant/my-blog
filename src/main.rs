use anyhow::Result;
use app::{router::get_router, state::State};
use axum::serve;
use std::env;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() -> Result<()> {
	let port: u16 = if let Ok(Ok(p)) = env::var("PORT").map(|p| p.parse()) {
		p
	} else {
		8080
	};
	let state = State {
		base_dir: ".".to_string(),
		rewrite_assets: true,
	};
	let app = get_router(state.clone());
	let listener = TcpListener::bind(("0.0.0.0", port))
		.await
		.expect("should listen");

	serve(listener, app.into_make_service())
		.await
		.expect("server should start");

	Ok(())
}
