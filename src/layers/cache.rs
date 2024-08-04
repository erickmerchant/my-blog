use axum::{
	body::Body,
	http::{header, Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
};
use camino::Utf8Path;
use etag::EntityTag;
use http_body_util::BodyExt;
use hyper::body::Bytes;
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use serde::{Deserialize, Serialize};
use serde_json as json;
use std::{collections::HashMap, fs, time::UNIX_EPOCH};
use url::Url;

pub async fn layer(req: Request<Body>, next: Next) -> Result<Response, crate::Error> {
	let (req_parts, req_body) = req.into_parts();
	let uri = req_parts.uri.clone();
	let mut path = uri.path().to_string();

	if path.is_empty() || path.ends_with('/') {
		path.push_str("index.html");
	}

	let path = Utf8Path::new(path.as_str());
	let ext = path.extension().unwrap_or_default();
	let new_path = path.with_extension("").with_extension(ext);
	let has_cache_buster = path != new_path;
	let cache_path = Utf8Path::new("storage").join(path);
	let content_type = mime_guess::from_path(cache_path.clone())
		.first()
		.map(|content_type| format!("{content_type}; charset=utf-8"))
		.unwrap_or("text/html; charset=utf-8".to_string());
	let body = if let Ok(cached_body) = fs::read_to_string(cache_path.clone()) {
		cached_body.as_bytes().to_vec()
	} else {
		let mut new_req = Request::from_parts(req_parts.clone(), req_body);

		*new_req.uri_mut() = path
			.with_extension("")
			.with_extension(ext)
			.to_string()
			.parse()?;

		let res = next.run(new_req).await;
		let body = res.into_body();
		let body = body.collect().await?;
		let body = body.to_bytes();
		let body = if content_type == *"text/html; charset=utf-8" {
			rewrite_assets(
				body,
				&Url::parse("http://example.com/")?.join(uri.to_string().as_str())?,
			)?
		} else {
			body.to_vec()
		};

		fs::create_dir_all(cache_path.clone().with_file_name("")).ok();
		fs::write(cache_path.clone(), &body).ok();

		body
	};
	let etag = EntityTag::from_data(&body).to_string();

	if req_parts
		.headers
		.get("if-none-match")
		.map_or(false, |if_none_match| etag == *if_none_match)
	{
		return Ok((StatusCode::NOT_MODIFIED).into_response());
	}

	if has_cache_buster {
		return Ok((
			StatusCode::OK,
			[
				(header::CONTENT_TYPE, content_type.to_string()),
				(
					header::CACHE_CONTROL,
					"public, max-age=31536000, immutable".to_string(),
				),
			],
			body,
		)
			.into_response());
	};

	Ok((
		StatusCode::OK,
		[
			(header::CONTENT_TYPE, content_type.to_string()),
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
	#[serde(default)]
	pub imports: Imports,
	#[serde(default)]
	pub scopes: Scopes,
}

impl ImportMap {
	pub fn map<M: Fn(String) -> String>(&mut self, map: M) -> &Self {
		for (key, value) in self.imports.clone() {
			self.imports.insert(key, map(value));
		}

		let mut new_scopes = Scopes::new();

		for (scope_key, old_map) in self.scopes.clone() {
			let mut new_map = Imports::new();

			for (key, value) in old_map {
				new_map.insert(key, map(value));
			}

			new_scopes.insert(scope_key, new_map);
		}

		self.scopes = new_scopes;

		self
	}
}

pub fn rewrite_assets(bytes: Bytes, base: &Url) -> anyhow::Result<Vec<u8>> {
	let mut output = Vec::<u8>::new();
	let mut rewriter = HtmlRewriter::new(
		Settings {
			element_content_handlers: vec![
				element!(
					"link[href][rel='stylesheet'], link[href][rel='icon']",
					|el| {
						if let Some(href) = el.get_attribute("href") {
							el.set_attribute("href", asset_url(href.as_str(), base).as_str())
								.ok();
						}

						Ok(())
					}
				),
				element!("script[src]", |el| {
					if let Some(src) = el.get_attribute("src") {
						el.set_attribute("src", asset_url(src.as_str(), base).as_str())
							.ok();
					}

					Ok(())
				}),
				text!("script[type='importmap']", |el| {
					if let Ok(mut import_map) = json::from_str::<ImportMap>(el.as_str()) {
						import_map.map(|u| asset_url(u.as_str(), base));

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

fn asset_url(url: &str, base: &Url) -> String {
	if let Ok(full_url) = base.join(url) {
		let path = full_url.path();
		let file_path = format!("./public{}", path);
		let file_path = Utf8Path::new(file_path.as_str());

		if let Ok(time) = fs::metadata(file_path).and_then(|meta| meta.modified()) {
			let path = Utf8Path::new(path);
			let version_time = time
				.duration_since(UNIX_EPOCH)
				.map(|d| d.as_secs())
				.expect("time should be a valid time since the unix epoch");
			let cache_key = base62::encode(version_time);
			let ext = path.extension().unwrap_or_default();

			return path
				.with_extension(format!("{cache_key}.{ext}"))
				.to_string();
		}
	};

	url.to_string()
}
