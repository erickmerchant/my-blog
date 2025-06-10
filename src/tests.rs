use crate::{get_app, state};
use anyhow::anyhow;
use app::error;
use axum::{
	body::Body,
	http::{header, header::HeaderValue, Request, StatusCode},
	response::{IntoResponse, Response},
	routing::get,
	Router,
};
use tower::ServiceExt;

async fn will_error_handler() -> Result<Response, error::Error> {
	let x: Result<String, _> = Err(anyhow!("test"));
	let x = x?;

	Ok(x.into_response())
}

async fn get_test_app() -> Router {
	let state = state::State::from_args(state::Args {
		base_dir: "fixtures".to_string(),
		port: 80,
	});
	let app = get_app(state);

	app.route("/will-error", get(will_error_handler))
}

#[tokio::test]
async fn test_500() {
	let app = get_test_app().await;
	let response = app
		.clone()
		.oneshot(
			Request::builder()
				.uri("/will-error")
				.body(Body::empty())
				.unwrap(),
		)
		.await
		.unwrap();

	assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
}

#[tokio::test]
async fn test_asset_cache_control() {
	let app = get_test_app().await;
	let response = app
		.clone()
		.oneshot(
			Request::builder()
				.uri("/test.css")
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
				.uri("/test.abcdefghij.css")
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
async fn test_index() {
	let app = get_test_app().await;
	let response = app
		.clone()
		.oneshot(
			Request::builder()
				.uri("/test-3/")
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
async fn test_html_etags() {
	let app = get_test_app().await;
	let response = app
		.clone()
		.oneshot(
			Request::builder()
				.uri("/test-1.html")
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
		.uri("/test-1.html")
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
async fn test_404() {
	let app = get_test_app().await;
	let response = app
		.clone()
		.oneshot(
			Request::builder()
				.uri("/test-4.html")
				.body(Body::empty())
				.unwrap(),
		)
		.await
		.unwrap();

	assert_eq!(response.status(), StatusCode::NOT_FOUND);
}
