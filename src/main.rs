mod args;
mod error;
mod layers;
mod models;
mod routes;
mod setup;
mod state;
mod templates;

use anyhow::Result;
use args::Args;
use axum::{
	http::Request,
	middleware::{from_fn, from_fn_with_state},
	response::Response,
	routing::get,
	serve, Router,
};
use clap::Parser;
use error::Error;
use layers::{assets::assets_layer, cache::cache_layer};
use routes::{entry::entry_handler, list::list_handler, rss::rss_handler};
use sea_orm::Database;
use setup::{content::import_content, schema::create_schema};
use state::State;
use std::{fs, sync::Arc, time::Duration};
use tokio::net::TcpListener;
use tower_http::{
	classify::ServerErrorsFailureClass, compression::CompressionLayer, trace::TraceLayer,
};

const DATABASE_URL: &str = "sqlite://./storage/content.db";

#[tokio::main]
async fn main() -> Result<()> {
	// setup
	fs::remove_dir_all("storage").ok();
	fs::create_dir_all("storage")?;

	let database = Database::connect(format!("{DATABASE_URL}?mode=rwc")).await?;

	create_schema(&database).await?;
	import_content(&database).await?;
	database.close().await?;
	// end setup

	let args = Args::parse();
	let port = args.listen;

	tracing_subscriber::fmt()
		.compact()
		.with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
		.init();

	let database = Database::connect(DATABASE_URL).await?;
	let templates = templates::Engine::new();
	let app_state = Arc::new(State {
		templates,
		database,
	});
	let mut app = Router::new()
		.route("/", get(list_handler))
		.route("/tags/:tag/", get(list_handler))
		.route("/posts/:slug/", get(entry_handler))
		.route("/posts.rss", get(rss_handler))
		.layer(from_fn(assets_layer));

	if !args.no_cache {
		app = app.layer(from_fn_with_state(app_state.clone(), cache_layer));
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
		.with_state(app_state);
	let listener = TcpListener::bind(("0.0.0.0", port))
		.await
		.expect("should listen");

	serve(listener, app.into_make_service())
		.await
		.expect("server should start");

	tracing::debug!("listening on port {port}");

	Ok(())
}
