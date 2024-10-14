mod error;
mod filesystem;
mod filters;
mod layers;
mod models;
mod routes;
mod state;

use anyhow::Result;
use axum::{middleware::from_fn_with_state, routing::get, serve, Router};
use error::Error;
use layers::html;
use routes::{asset, home, not_found, post, project, resume, rss};
use state::State;
use std::{env, sync::Arc};
use tokio::net::TcpListener;
use tower_http::{compression::CompressionLayer, trace::TraceLayer};

#[tokio::main]
async fn main() -> Result<()> {
	let port: u16 = if let Ok(Ok(p)) = env::var("PORT").map(|p| p.parse()) {
		p
	} else {
		8080
	};
	let state = State {
		base_dir: ".".to_string(),
	};

	tracing_subscriber::fmt()
		.compact()
		.with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
		.init();

	let app = get_app(state.clone());
	let listener = TcpListener::bind(("0.0.0.0", port))
		.await
		.expect("should listen");

	tracing::debug!("listening on port {port}");

	serve(listener, app.into_make_service())
		.await
		.expect("server should start");

	Ok(())
}

fn get_app(state: State) -> Router {
	let state = Arc::new(state);

	Router::new()
		.route("/", get(home::handler))
		.route("/resume/", get(resume::handler))
		.route("/projects/:project/", get(project::handler))
		.route("/posts/:slug/", get(post::handler))
		.route_layer(from_fn_with_state(state.clone(), html::layer))
		.route("/posts.rss", get(rss::handler))
		.route("/*path", get(asset::handler))
		.fallback(not_found::handler)
		.with_state(state.clone())
		.layer(CompressionLayer::new())
		.layer(TraceLayer::new_for_http())
}

#[cfg(test)]
mod tests {
	use super::{get_app, State};
	use axum::{
		body::Body,
		http::{header, header::HeaderValue, Request, StatusCode},
		Router,
	};
	use tokio::fs;
	use tower::ServiceExt;

	async fn get_test_app() -> Router {
		fs::remove_dir_all("storage/tmp").await.ok();

		let state = State {
			base_dir: "fixtures".to_string(),
		};

		get_app(state)
	}

	#[tokio::test]
	async fn test_home_200_and_304() {
		let app = get_test_app().await;
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

	#[tokio::test]
	async fn test_asset_cache_control() {
		let app = get_test_app().await;
		let response = app
			.clone()
			.oneshot(
				Request::builder()
					.uri("/page.css")
					.body(Body::empty())
					.unwrap(),
			)
			.await
			.unwrap();

		assert_eq!(response.status(), StatusCode::OK);

		let cache_control = response.headers().get(header::CACHE_CONTROL);

		assert!(cache_control.is_some());

		let cache_control = cache_control.unwrap();

		assert_eq!(
			cache_control,
			&HeaderValue::from_static("public, max-age=86400")
		);

		let response = app
			.clone()
			.oneshot(
				Request::builder()
					.uri("/page.css?v=abcxyz")
					.body(Body::empty())
					.unwrap(),
			)
			.await
			.unwrap();

		assert_eq!(response.status(), StatusCode::OK);

		let cache_control = response.headers().get(header::CACHE_CONTROL);

		assert!(cache_control.is_some());

		let cache_control = cache_control.unwrap();

		assert_eq!(
			cache_control,
			&HeaderValue::from_static("public, max-age=31536000, immutable")
		);
	}

	#[tokio::test]
	async fn test_asset_index() {
		let app = get_test_app().await;
		let response = app
			.clone()
			.oneshot(
				Request::builder()
					.uri("/projects/test/")
					.body(Body::empty())
					.unwrap(),
			)
			.await
			.unwrap();
		let cache_control = response.headers().get(header::CACHE_CONTROL);

		assert!(cache_control.is_none());

		assert_eq!(response.status(), StatusCode::OK);
	}

	#[tokio::test]
	async fn test_rss() {
		let app = get_test_app().await;
		let response = app
			.clone()
			.oneshot(
				Request::builder()
					.uri("/posts.rss")
					.body(Body::empty())
					.unwrap(),
			)
			.await
			.unwrap();
		let cache_control = response.headers().get(header::CACHE_CONTROL);

		assert!(cache_control.is_none());

		let etag = response.headers().get(header::ETAG);

		assert!(etag.is_none());

		assert_eq!(response.status(), StatusCode::OK);
	}

	#[tokio::test]
	async fn test_post_200() {
		let app = get_test_app().await;
		let response = app
			.clone()
			.oneshot(
				Request::builder()
					.uri("/posts/test-post/")
					.body(Body::empty())
					.unwrap(),
			)
			.await
			.unwrap();

		assert_eq!(response.status(), StatusCode::OK);
	}

	#[tokio::test]
	async fn test_post_404() {
		let app = get_test_app().await;
		let response = app
			.clone()
			.oneshot(
				Request::builder()
					.uri("/posts/test-post-2/")
					.body(Body::empty())
					.unwrap(),
			)
			.await
			.unwrap();

		assert_eq!(response.status(), StatusCode::NOT_FOUND);
	}

	#[tokio::test]
	async fn test_404() {
		let app = get_test_app().await;
		let response = app
			.clone()
			.oneshot(
				Request::builder()
					.uri("/posts/test-post")
					.body(Body::empty())
					.unwrap(),
			)
			.await
			.unwrap();

		assert_eq!(response.status(), StatusCode::NOT_FOUND);

		let response = app
			.clone()
			.oneshot(
				Request::builder()
					.uri("/articles/test-post")
					.body(Body::empty())
					.unwrap(),
			)
			.await
			.unwrap();

		assert_eq!(response.status(), StatusCode::NOT_FOUND);
	}
}
