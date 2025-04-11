use anyhow::Result;
use app::{
	layers::html,
	models::Model,
	routes::{asset, home, not_found, page, post, resume, rss},
	state::State,
};
use axum::{middleware::from_fn_with_state, routing::get, serve, Router};
use glob::glob;
use std::{env, fs, str::FromStr, sync::Arc};
use tokio::net::TcpListener;
use tower_http::{compression::CompressionLayer, trace::TraceLayer};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> Result<()> {
	let port: u16 = get_env("APP_PORT", 8080);
	let rewrite_assets: bool = get_env("APP_REWRITE_ASSETS", true);
	let state = State {
		base_dir: ".".to_string(),
		rewrite_assets,
		model: Model::new(".".to_string()),
	};

	tracing_subscriber::fmt()
		.with_env_filter(EnvFilter::try_from_default_env().unwrap_or_default())
		.init();

	let app = get_app(state.clone());
	let listener = TcpListener::bind(("0.0.0.0", port))
		.await
		.expect("should listen");

	serve(listener, app.into_make_service())
		.await
		.expect("server should start");

	Ok(())
}

fn get_env<T>(name: &str, default_value: T) -> T
where
	T: FromStr,
{
	if let Ok(Ok(p)) = env::var(name).map(|p| p.parse::<T>()) {
		p
	} else {
		default_value
	}
}

fn get_app(state: State) -> Router {
	fs::remove_dir_all(state.base_dir.trim_end_matches("/").to_string() + "/storage/cache/").ok();

	let state = Arc::new(state);
	let mut router = Router::new()
		.route("/", get(home::home_handler))
		.route("/resume/", get(resume::resume_handler))
		.route("/posts/{slug}/", get(post::post_handler));
	let public_path = state.base_dir.trim_end_matches("/").to_owned() + "/public";
	let public_path = public_path.trim_start_matches("./");
	let public_htmls = glob((public_path.to_owned() + "/**/*.html").as_str()).ok();

	if let Some(paths) = public_htmls {
		for path in paths.flatten() {
			if let Some(p) = path.to_str() {
				let p = p
					.trim_start_matches(public_path)
					.trim_end_matches("index.html");

				router = router.route(p, get(page::page_handler));
			}
		}
	}

	router
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
		let state = State {
			base_dir: "fixtures".to_string(),
			rewrite_assets: true,
			model: Model::new("fixtures".to_string()),
		};
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
