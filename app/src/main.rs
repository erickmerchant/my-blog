use anyhow::Result;
use app::{args, layers, routes, state, templates, DATABASE_URL};
use args::Args;
use axum::{
	http::Request,
	middleware::{from_fn, from_fn_with_state},
	response::Response,
	routing::get,
	Router, Server,
};
use clap::Parser;
use layers::{assets::assets_layer, cache::cache_layer};
use routes::{entry::entry_handler, permalink::permalink_handler, rss::rss_handler};
use sea_orm::Database;
use state::State;
use std::{net::SocketAddr, sync::Arc, time::Duration};
use tower_http::{
	classify::ServerErrorsFailureClass, compression::CompressionLayer, trace::TraceLayer,
};

#[tokio::main]
async fn main() -> Result<()> {
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
		.route("/:category/:slug/", get(entry_handler))
		.route("/:category/:slug/feed.rss", get(rss_handler))
		.fallback(permalink_handler)
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
	let addr = SocketAddr::from(([0, 0, 0, 0], port));

	Server::bind(&addr)
		.serve(app.into_make_service())
		.await
		.expect("server should start");

	tracing::debug!("listening on {addr}");

	Ok(())
}
