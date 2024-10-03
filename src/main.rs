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

pub fn app(state: State) -> Router {
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

#[cfg(test)]
mod tests {
	use super::{app, FileSystem, State};
	use axum::{
		body::Body,
		http::{header, Request, StatusCode},
	};
	// use http_body_util::BodyExt;
	use tokio::fs;
	use tower::ServiceExt;

	#[tokio::test]
	async fn test_home_200_and_304() {
		fs::remove_dir_all("storage/tmp").await.ok();
		let state = State {
			public: FileSystem {
				directory: "fixtures/public".to_string(),
			},
			content: FileSystem {
				directory: "fixtures/content".to_string(),
			},
			storage: FileSystem {
				directory: "storage/tmp".to_string(),
			},
		};

		let app = app(state);

		// `Router` implements `tower::Service<Request<Body>>` so we can
		// call it like any tower service, no need to run an HTTP server.
		let response = app
			.clone()
			.oneshot(Request::builder().uri("/").body(Body::empty()).unwrap())
			.await
			.unwrap();

		assert_eq!(response.status(), StatusCode::OK);

		let etag = response.headers().get(header::ETAG);

		assert!(etag.is_some());

		let etag = etag.unwrap();
		let mut req = Request::builder().uri("/").body(Body::empty()).unwrap();

		req.headers_mut()
			.insert(header::IF_NONE_MATCH, etag.to_owned());

		let response = app.oneshot(req).await.unwrap();

		assert_eq!(response.status(), StatusCode::NOT_MODIFIED);
	}
}
