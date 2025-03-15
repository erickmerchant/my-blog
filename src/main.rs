use anyhow::Result;
use app::{
	layers::html,
	models::Model,
	routes::{asset, home, not_found, post, resume, rss},
	state::State,
};
use axum::{middleware::from_fn_with_state, routing::get, serve, Router};
use std::{env, sync::Arc};
use tokio::net::TcpListener;
use tower_http::{compression::CompressionLayer, trace::TraceLayer};

#[tokio::main]
async fn main() -> Result<()> {
	let port: u16 = if let Ok(Ok(p)) = env::var("APP_PORT").map(|p| p.parse()) {
		p
	} else {
		8080
	};
	let rewrite_assets: bool = if let Ok(Ok(p)) = env::var("APP_REWRITE_ASSETS").map(|p| p.parse())
	{
		p
	} else {
		true
	};
	let state = State {
		base_dir: ".".to_string(),
		rewrite_assets,
		model: Model::new(".".to_string()),
	};
	let app = get_app(state.clone());
	let listener = TcpListener::bind(("0.0.0.0", port))
		.await
		.expect("should listen");

	serve(listener, app.into_make_service())
		.await
		.expect("server should start");

	Ok(())
}

pub fn get_app(state: State) -> Router {
	let state = Arc::new(state);

	Router::new()
		.route("/", get(home::home_handler))
		.route("/resume/", get(resume::resume_handler))
		.route("/posts/{slug}/", get(post::post_handler))
		.route_layer(from_fn_with_state(state.clone(), html::html_layer))
		.route("/posts.rss", get(rss::rss_handler))
		.route("/{*path}", get(asset::asset_handler))
		.fallback(not_found::not_found_handler)
		.with_state(state.clone())
		.layer(CompressionLayer::new())
		.layer(TraceLayer::new_for_http())
}

#[cfg(test)]
mod tests {
	use super::{get_app, Model, State};
	use axum::{
		body::Body,
		http::{header, header::HeaderValue, Request, StatusCode},
		Router,
	};
	use tower::ServiceExt;

	async fn get_test_app() -> Router {
		let state = State {
			base_dir: "fixtures".to_string(),
			rewrite_assets: true,
			model: Model::new("fixtures".to_string()),
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
					.uri("/page.abcdefghij.css")
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
	async fn test_asset_html() {
		let app = get_test_app().await;
		let response = app
			.clone()
			.oneshot(
				Request::builder()
					.uri("/page.html")
					.body(Body::empty())
					.unwrap(),
			)
			.await
			.unwrap();
		let cache_control = response.headers().get(header::CACHE_CONTROL);

		assert!(cache_control.is_none());

		assert_eq!(response.status(), StatusCode::OK);

		let etag = response.headers().get(header::ETAG);

		assert!(etag.is_some());

		let etag = etag.unwrap();
		let mut req = Request::builder()
			.uri("/page.html")
			.body(Body::empty())
			.unwrap();

		req.headers_mut()
			.insert(header::IF_NONE_MATCH, etag.to_owned());

		let response = app.oneshot(req).await.unwrap();
		let cache_control = response.headers().get(header::CACHE_CONTROL);

		assert!(cache_control.is_none());

		assert_eq!(response.status(), StatusCode::NOT_MODIFIED);
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
