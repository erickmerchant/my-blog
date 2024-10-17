use crate::filesystem::*;
use axum::{
	body::{to_bytes, Body},
	extract::State,
	http::{header, Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use etag::EntityTag;
use hyper::body::Bytes;
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use serde::{Deserialize, Serialize};
use serde_json as json;
use std::{collections::HashMap, sync::Arc, time::UNIX_EPOCH};
use url::Url;

pub async fn layer(
	State(state): State<Arc<crate::State>>,
	req: Request<Body>,
	next: Next,
) -> Result<Response, crate::Error> {
	let (req_parts, req_body) = req.into_parts();
	let headers = &req_parts.headers;
	let if_none_match = headers.get(header::IF_NONE_MATCH);
	let uri = &req_parts.uri;
	let new_req = Request::from_parts(req_parts.clone(), req_body);
	let res = next.run(new_req).await;

	if res.status() != StatusCode::OK {
		return Ok(res);
	}

	let body = res.into_body();
	let body = to_bytes(body, usize::MAX).await?;
	let cache_buster = CacheBuster {
		url: Url::parse("https://0.0.0.0")?.join(uri.to_string().as_str())?,
		base_dir: state.base_dir.clone(),
	};
	let body = cache_buster.rewrite_assets(&body)?;
	let etag = EntityTag::from_data(&body).to_string();

	if if_none_match.map_or(false, |if_none_match| etag == *if_none_match) {
		return Ok((StatusCode::NOT_MODIFIED).into_response());
	}

	Ok((
		StatusCode::OK,
		[
			(header::CONTENT_TYPE, mime::TEXT_HTML.to_string()),
			(header::ETAG, etag),
		],
		body,
	)
		.into_response())
}

type Imports = HashMap<String, String>;
type Scopes = HashMap<String, Imports>;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ImportMap {
	pub imports: Option<Imports>,
	pub scopes: Option<Scopes>,
}

impl ImportMap {
	pub fn map<M: Fn(&str) -> String>(&mut self, map: M) -> &Self {
		let mut imports = Imports::new();

		for (key, value) in self.imports.clone().unwrap_or_default() {
			imports.insert(key, map(&value));
		}

		self.imports = Some(imports);

		let mut scopes = Scopes::new();

		for (scope_key, old_map) in self.scopes.clone().unwrap_or_default() {
			let mut new_map = Imports::new();

			for (key, value) in old_map {
				new_map.insert(key, map(&value));
			}

			scopes.insert(scope_key, new_map);
		}

		self.scopes = Some(scopes);

		self
	}
}

struct CacheBuster {
	base_dir: String,
	url: Url,
}

impl CacheBuster {
	pub fn rewrite_assets(&self, bytes: &Bytes) -> anyhow::Result<Vec<u8>> {
		let mut output = vec![];
		let mut rewriter = HtmlRewriter::new(
			Settings {
				element_content_handlers: vec![
					element!(
						"link[href][rel='stylesheet'], link[href][rel='icon']",
						|el| {
							if let Some(href) = el.get_attribute("href") {
								el.set_attribute("href", self.get_url(href.as_str()).as_str())
									.ok();
							}

							Ok(())
						}
					),
					element!("script[src]", |el| {
						if let Some(src) = el.get_attribute("src") {
							el.set_attribute("src", self.get_url(src.as_str()).as_str())
								.ok();
						}

						Ok(())
					}),
					text!("script[type='importmap']", |el| {
						if let Ok(mut import_map) = json::from_str::<ImportMap>(el.as_str()) {
							import_map.map(|u| self.get_url(u));

							if let Ok(map) = json::to_string(&import_map) {
								el.replace(map.as_str(), ContentType::Text);
							}
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

	pub fn get_url(&self, url: &str) -> String {
		if let Ok(full_url) = self.url.join(url) {
			let full_url_path = full_url.path();
			let file_path = format!(
				"{}/public/{}",
				self.base_dir,
				full_url_path.trim_start_matches("/")
			);

			if let Ok(time) = modified(Utf8Path::new(file_path.as_str()).to_path_buf()) {
				let path = Utf8Path::new(full_url_path);
				let version_time = time
					.duration_since(UNIX_EPOCH)
					.map(|d| d.as_secs())
					.expect("time should be a valid time since the unix epoch");
				let cache_key = base62::encode(version_time);

				return format!("{path}?v={cache_key}").to_string();
			}
		};

		url.to_string()
	}
}
