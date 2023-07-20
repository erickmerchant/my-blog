use crate::{error::AppError, models::cache, state::AppState};
use axum::{
	http::{Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
	{extract::State, http::header},
};
use camino::Utf8Path;
use etag::EntityTag;
use hyper::{body::to_bytes, body::Bytes, header::HeaderValue, Body, HeaderMap};
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use mime_guess::mime::TEXT_HTML_UTF_8;
use sea_orm::{entity::prelude::*, query::*, ActiveValue::Set};
use serde::{Deserialize, Serialize};
use serde_json as json;
use std::{collections::HashMap, fs, time::UNIX_EPOCH};

pub async fn cache<B>(
	State(app_state): State<AppState>,
	req: Request<B>,
	next: Next<B>,
) -> Result<Response, AppError> {
	if envmnt::is("APP_DEV") {
		return Ok(next.run(req).await);
	}

	let uri = req.uri().to_string();
	let cache_result: Option<cache::Model> = cache::Entity::find()
		.filter(Condition::all().add(cache::Column::Path.eq(uri.clone())))
		.one(&app_state.database.clone())
		.await?;

	if let Some(cache_result) = cache_result {
		let res_headers = HeaderMap::new();

		return if cache_result.content_type == TEXT_HTML_UTF_8.to_string() {
			let etag_matches = if let Some(etag) = cache_result.etag.clone() {
				let etag = etag.parse::<EntityTag>().ok();
				let req_headers = req.headers().clone();

				Some(
					get_header(req_headers, "if-none-match".to_string())
						.and_then(|h| h.parse::<EntityTag>().ok())
						.is_some_and(|if_none_match| {
							etag.is_some_and(|etag| etag.weak_eq(&if_none_match))
						}),
				)
			} else {
				None
			};

			if etag_matches.is_some_and(|m| m) {
				Ok(StatusCode::NOT_MODIFIED.into_response())
			} else {
				Ok((
					set_headers(res_headers, cache_result.content_type, cache_result.etag),
					cache_result.body,
				)
					.into_response())
			}
		} else {
			Ok((
				set_headers(res_headers, cache_result.content_type, None),
				cache_result.body,
			)
				.into_response())
		};
	};

	let res = next.run(req).await;
	let (mut parts, body) = res.into_parts();
	let bytes = to_bytes(body).await;
	let mut output = vec![];

	if let Ok(bytes) = bytes {
		if let Some(content_type) = get_header(parts.headers.clone(), "content-type".to_string()) {
			let mut etag = None;

			if content_type == TEXT_HTML_UTF_8.to_string() {
				let etag_string = EntityTag::from_data(&bytes).to_string();

				etag = Some(etag_string.clone());
				output = rewrite_assets(bytes, output)?;
			} else {
				output = bytes.to_vec();
			};

			let cache_model = cache::ActiveModel {
				path: Set(uri),
				content_type: Set(content_type.clone()),
				etag: Set(etag.clone()),
				body: Set(output.clone()),
				..Default::default()
			};

			cache_model.clone().insert(&app_state.database).await.ok();
			parts.headers = set_headers(parts.headers, content_type, etag);
		};

		Ok(Response::from_parts(parts, Body::from(output)).into_response())
	} else {
		Ok(StatusCode::INTERNAL_SERVER_ERROR.into_response())
	}
}

fn get_header(headers: HeaderMap, key: String) -> Option<String> {
	headers
		.get(key)
		.and_then(|h| h.to_str().ok())
		.map(|h| h.to_string())
}

fn set_headers(mut headers: HeaderMap, content_type: String, etag: Option<String>) -> HeaderMap {
	let cache_control = format!("public, max-age={}, immutable", 60 * 60 * 24 * 365);

	headers.insert(
		header::CONTENT_TYPE,
		HeaderValue::from_str(content_type.as_str()).expect("should be a valid content type"),
	);

	if content_type == TEXT_HTML_UTF_8.to_string() {
		if let Some(etag) = etag {
			headers.insert(
				header::ETAG,
				HeaderValue::from_str(etag.as_str()).expect("should be valid etag"),
			);
		}
	} else {
		headers.insert(
			header::CACHE_CONTROL,
			HeaderValue::from_str(cache_control.as_str())
				.expect("should be valid cache control value"),
		);
	}

	headers
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct ImportMap {
	#[serde(default)]
	imports: HashMap<String, String>,
	#[serde(default)]
	scopes: HashMap<String, HashMap<String, String>>,
}

fn rewrite_assets(bytes: Bytes, mut output: Vec<u8>) -> anyhow::Result<Vec<u8>> {
	let mut rewriter = HtmlRewriter::new(
		Settings {
			element_content_handlers: vec![
				element!("link[href]", |el| {
					if let Some(href) = el.get_attribute("href") {
						el.set_attribute("href", asset_url(href.to_string()).as_str())
							.ok();
					}

					Ok(())
				}),
				element!("script[src]", |el| {
					if let Some(src) = el.get_attribute("src") {
						el.set_attribute("src", asset_url(src.to_string()).as_str())
							.ok();
					}

					Ok(())
				}),
				text!("script[type='importmap']", |el| {
					if let Ok(mut import_map) = json::from_str::<ImportMap>(el.as_str()) {
						for (key, value) in import_map.imports.clone() {
							import_map.imports.insert(key, asset_url(value));
						}

						let mut new_scopes: HashMap<String, HashMap<String, String>> =
							HashMap::new();
						for (scope_key, old_map) in import_map.scopes.clone() {
							let mut new_map: HashMap<String, String> = HashMap::new();
							for (key, value) in old_map {
								new_map.insert(key, asset_url(value));
							}

							new_scopes.insert(scope_key, new_map);
						}

						import_map.scopes = new_scopes;

						el.replace(
							json::to_string(&import_map).unwrap().as_str(),
							ContentType::Text,
						);
					}

					Ok(())
				}),
			],
			..Default::default()
		},
		|c: &[u8]| output.extend_from_slice(c),
	);

	rewriter.write(bytes.as_ref())?;
	rewriter.end()?;

	Ok(output)
}

fn asset_url(mut url: String) -> String {
	if url.starts_with('/') && !envmnt::is("APP_DEV") {
		if let Ok(time) = fs::metadata(format!("theme{url}")).and_then(|meta| meta.modified()) {
			let version_time = time
				.duration_since(UNIX_EPOCH)
				.map(|d| d.as_secs())
				.expect("time should be a valid time since the unix epoch");
			let cache_key = base62::encode(version_time);
			let path = Utf8Path::new(&url);
			let ext = path.extension().unwrap_or_default();
			url = path
				.with_extension(format!("{cache_key}.{ext}"))
				.to_string();
		}
	};

	url
}
