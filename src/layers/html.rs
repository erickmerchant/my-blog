use crate::{error, state};
use axum::{
	body::{to_bytes, Body},
	extract::State,
	http::{header, HeaderValue, Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use etag::EntityTag;
use hyper::{body::Bytes, Uri};
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use serde::{Deserialize, Serialize};
use serde_json as json;
use std::{collections::HashMap, fs, sync::Arc, time::UNIX_EPOCH};
use url::Url;

pub async fn apply_html_layer(
	State(state): State<Arc<state::State>>,
	if_none_match: Option<&HeaderValue>,
	uri: &Uri,
	res: Response,
) -> Result<Response, error::Error> {
	if res.status() != StatusCode::OK {
		return Ok(res);
	}

	let body = res.into_body();
	let body = to_bytes(body, usize::MAX).await?;
	let cache_buster = CacheBuster {
		url: Url::parse("https://0.0.0.0")?.join(uri.to_string().as_str())?,
		base_dir: state.base_dir.to_owned(),
	};
	let body = cache_buster.rewrite_assets(&body)?;
	let etag = EntityTag::from_data(&body).to_string();

	if if_none_match.is_some_and(|if_none_match| etag == *if_none_match) {
		return Ok(StatusCode::NOT_MODIFIED.into_response());
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

pub async fn html_layer(
	State(state): State<Arc<state::State>>,
	req: Request<Body>,
	next: Next,
) -> Result<Response, error::Error> {
	let (req_parts, req_body) = req.into_parts();
	let new_req = Request::from_parts(req_parts.to_owned(), req_body);
	let headers = &req_parts.headers;
	let if_none_match = headers.get(header::IF_NONE_MATCH);
	let uri = &req_parts.uri;

	apply_html_layer(State(state), if_none_match, uri, next.run(new_req).await).await
}

type Imports = HashMap<String, String>;
type Scopes = HashMap<String, Imports>;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ImportMap {
	#[serde(skip_serializing_if = "Option::is_none")]
	pub imports: Option<Imports>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub scopes: Option<Scopes>,
}

impl ImportMap {
	pub fn map<M: Fn(&str) -> String>(&mut self, map: M) -> &Self {
		if self.imports.is_some() {
			let mut imports = Imports::new();

			for (key, value) in self.imports.as_ref().unwrap_or(&Imports::new()) {
				imports.insert(key.to_owned(), map(value));
			}

			self.imports = Some(imports);
		}

		if self.scopes.is_some() {
			let mut scopes = Scopes::new();

			for (scope_key, old_map) in self.scopes.as_ref().unwrap_or(&Scopes::new()) {
				let mut new_map = Imports::new();

				for (key, value) in old_map {
					new_map.insert(key.to_owned(), map(value));
				}

				scopes.insert(scope_key.to_owned(), new_map);
			}

			self.scopes = Some(scopes);
		}

		self
	}
}

struct CacheBuster {
	base_dir: String,
	url: Url,
}

impl CacheBuster {
	pub fn rewrite_assets(&self, bytes: &Bytes) -> anyhow::Result<Vec<u8>> {
		let mut output = Vec::new();
		let mut rewriter = HtmlRewriter::new(
			Settings {
				element_content_handlers: [
					element!("head", |el| {
						el.append(
							r#"<link rel="icon" href="/favicon.svg" type="image/svg+xml" />"#,
							ContentType::Html,
						);

						Ok(())
					}),
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
				]
				.into(),
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

			if let Ok(Ok(time)) = fs::metadata(Utf8Path::new(file_path.as_str()).to_path_buf())
				.map(|meta| meta.modified())
			{
				let path = Utf8Path::new(full_url_path)
					.to_string()
					.trim_start_matches("/")
					.to_string();
				let version_time = time
					.duration_since(UNIX_EPOCH)
					.map(|d| d.as_secs())
					.expect("time should be a valid time since the unix epoch");
				let cache_key = base62::encode(version_time);

				return format!("/v/{cache_key}/{path}").to_string();
			}
		};

		url.to_string()
	}
}
