use app::{
	args::Args,
	middleware::cache::*,
	routes::{asset::*, entry::*, permalink::*, robots::*, rss::*},
	state::AppState,
	templates,
};
use axum::{
	http::Request, middleware::from_fn_with_state, response::Response, routing::get, Router, Server,
};
use clap::Parser;
use sea_orm::Database;
use std::{io, net::SocketAddr, sync::Arc, time::Duration};
use tower_http::{
	classify::ServerErrorsFailureClass, compression::CompressionLayer, trace::TraceLayer,
};

#[tokio::main]
async fn main() -> io::Result<()> {
	let args = Args::parse();

	tracing_subscriber::fmt()
		.compact()
		.with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
		.init();

	let port = args.listen;
	let templates = templates::get_env();
	let database = Database::connect("sqlite://./storage/content.db")
		.await
		.expect("database should connect");
	let app_state = Arc::new(AppState {
		templates,
		database,
	});
	let mut app = Router::new()
		.route("/robots.txt", get(robots))
		.route("/theme/*path", get(asset))
		.route("/:category/:slug/rss/", get(rss))
		.route("/:category/:slug/", get(entry))
		.fallback(permalink);

	if !args.no_cache {
		app = app.layer(from_fn_with_state(app_state.clone(), cache));
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
