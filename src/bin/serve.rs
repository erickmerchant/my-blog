use anyhow::Result;
use app::{args, middleware, routes, setup, state, templates};
use args::Args;
use axum::{
	http::Request, middleware::from_fn_with_state, response::Response, routing::get, Router, Server,
};
use clap::Parser;
use middleware::cache::*;
use routes::{entry::*, fallback::*, rss::*};
use sea_orm::Database;
use setup::{create_schema::*, import_content::*};
use state::AppState;
use std::{fs, net::SocketAddr, sync::Arc, time::Duration};
use tower_http::{
	classify::ServerErrorsFailureClass, compression::CompressionLayer, trace::TraceLayer,
};

static DATABASE_URL: &str = "sqlite://./storage/content.db";

#[tokio::main]
async fn main() -> Result<()> {
	// setup
	fs::remove_dir_all("storage").ok();
	fs::create_dir_all("storage")?;

	let database = Database::connect(format!("{}?mode=rwc", DATABASE_URL)).await?;

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

	let database = Database::connect(DATABASE_URL.to_string()).await?;
	let templates = templates::get_env();
	let app_state = Arc::new(AppState {
		templates,
		database,
	});
	let mut app = Router::new()
		.route("/:category/:slug/", get(entry_handler))
		.route("/:category/:slug/feed.rss", get(rss_handler))
		.fallback(fallback_handler);

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
	let addr = SocketAddr::from(([0, 0, 0, 0], port));

	Server::bind(&addr)
		.serve(app.into_make_service())
		.await
		.expect("server should start");

	tracing::debug!("listening on {addr}");

	Ok(())
}
