pub mod filters;
mod layers;
mod models;
mod routes;

use anyhow::Result;
use axum::{
	http::StatusCode,
	middleware::from_fn,
	response::{IntoResponse, Response},
	routing::get,
	serve, Router,
};
use layers::cache;
use routes::{asset, entry, home, rss};
use std::env;
use tokio::{fs, net::TcpListener};
use tower_http::{compression::CompressionLayer, trace::TraceLayer};

#[tokio::main]
async fn main() -> Result<()> {
	fs::remove_dir_all("storage").await.ok();

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
		.route("/", get(home::handler))
		.route("/posts/:slug/", get(entry::handler))
		.route("/posts.rss", get(rss::handler))
		.fallback(asset::handler)
		.layer(from_fn(cache::layer))
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

pub struct Error(anyhow::Error);

impl IntoResponse for Error {
	fn into_response(self) -> Response {
		let Error(err) = self;

		(
			StatusCode::INTERNAL_SERVER_ERROR,
			err.backtrace().to_string(),
		)
			.into_response()
	}
}

impl<E> From<E> for Error
where
	E: Into<anyhow::Error>,
{
	fn from(err: E) -> Self {
		Self(err.into())
	}
}
