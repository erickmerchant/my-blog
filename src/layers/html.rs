use crate::{error, state};
use axum::{
	body::{to_bytes, Body},
	extract::State,
	http::{header, Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use etag::EntityTag;
use glob::glob;
use hyper::{body::Bytes, HeaderMap, Uri};
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use serde::{Deserialize, Serialize};
use serde_json as json;
use std::{collections::BTreeMap, fs, sync::Arc};
use url::Url;

pub async fn apply_html_layer(
	State(state): State<Arc<state::State>>,
	headers: &HeaderMap,
	uri: &Uri,
	res: Response,
) -> Result<Response, error::Error> {
	if res.status() != StatusCode::OK {
		return Ok(res);
	}

	let if_none_match = headers.get(header::IF_NONE_MATCH);
	let cache_control = headers.get(header::CACHE_CONTROL);
	let mut no_cache = false;

	if let Some(cache_control) = cache_control {
		if cache_control == "no-cache" {
			no_cache = true;
		}
	}

	let body = res.into_body();
	let body = to_bytes(body, usize::MAX).await?;
	let cache_buster = CacheBuster {
		url: Url::parse("https://0.0.0.0")?.join(uri.to_string().as_str())?,
		base_dir: state.base_dir.to_owned(),
	};
	let body = if !no_cache {
		cache_buster.rewrite_assets(&body)?
	} else {
		body.to_vec()
	};
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
	let uri = &req_parts.uri;
	let res = next.run(new_req).await;

	apply_html_layer(State(state), headers, uri, res).await
}

type Imports = BTreeMap<String, String>;
type Scopes = BTreeMap<String, Imports>;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ImportMap {
	#[serde(skip_serializing_if = "Option::is_none")]
	pub imports: Option<Imports>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub scopes: Option<Scopes>,
}

impl ImportMap {
	pub fn map(&mut self, cache_buster: &CacheBuster) -> &Self {
		self.imports = self.map_imports(self.imports.to_owned(), cache_buster);

		if self.scopes.is_some() {
			let mut scopes = Scopes::new();

			for (scope_key, old_map) in self.scopes.as_ref().unwrap_or(&Scopes::new()) {
				if let Some(new_map) = self.map_imports(Some(old_map.to_owned()), cache_buster) {
					scopes.insert(scope_key.to_owned(), new_map);
				}
			}

			self.scopes = Some(scopes);
		}

		self
	}

	fn map_imports(&self, imports: Option<Imports>, cache_buster: &CacheBuster) -> Option<Imports> {
		imports.as_ref()?;

		let mut new_imports = Imports::new();

		for (key, value) in imports.as_ref().unwrap_or(&Imports::new()) {
			if value.ends_with("/") {
				if let Ok(full_url) = cache_buster.url.join(value) {
					let full_url_path = full_url.path();
					let results = glob(
						format!(
							"{}/public/{}**/*.js",
							cache_buster.base_dir,
							full_url_path.trim_start_matches("/")
						)
						.as_str(),
					)
					.ok();

					if let Some(paths) = results {
						for path in paths.flatten() {
							let path = path.to_string_lossy();
							let relative_key = path.trim_start_matches(
								format!("{}/public", cache_buster.base_dir)
									.trim_start_matches("./"),
							);
							let relative_path = path.trim_start_matches(
								format!(
									"{}/public/{}",
									cache_buster.base_dir,
									full_url_path.trim_start_matches("/")
								)
								.trim_start_matches("./"),
							);

							new_imports.insert(
								format!("{key}{relative_path}"),
								cache_buster.get_url(format!("{value}{relative_path}").as_str()),
							);
							new_imports.insert(
								relative_key.to_string(),
								cache_buster.get_url(format!("{value}{relative_path}").as_str()),
							);
						}
					}
				}

				new_imports.insert(key.to_owned(), value.to_owned());
			} else {
				new_imports.insert(key.to_owned(), cache_buster.get_url(value));
			}
		}

		Some(new_imports)
	}
}

pub struct CacheBuster {
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
							import_map.map(self);

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

			if let Ok(body) = fs::read_to_string(Utf8Path::new(file_path.as_str()).to_path_buf()) {
				let hash = md5::compute(body.as_bytes());
				let mut new_ext = format!("{hash:?}")[0..10].to_string();
				let path = Utf8Path::new(full_url_path);

				if let Some(ext) = path.extension() {
					new_ext = format!("{new_ext}.{ext}");
				}

				let path = path.with_extension(new_ext);

				return path.to_string();
			}
		};

		url.to_string()
	}
}
