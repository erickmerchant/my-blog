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
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json as json;
use std::{
	collections::{BTreeMap, BTreeSet},
	fs,
	sync::{Arc, LazyLock},
};
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

	let body = res.into_body();
	let body = to_bytes(body, usize::MAX).await?;
	let optimizer = Optimizer {
		url: Url::parse("https://0.0.0.0")?.join(uri.to_string().as_str())?,
		base_dir: state.base_dir.to_owned(),
	};
	let body = if state.rewrite_assets {
		optimizer.rewrite_assets(&body)?
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

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ImportMap {
	pub imports: Imports,
}

impl ImportMap {
	pub fn map(&mut self, optimizer: &Optimizer) -> &Self {
		let mut new_imports = Imports::new();

		for (key, value) in self.imports.clone() {
			if value.ends_with("/") {
				if let Ok(full_url) = optimizer.url.join(&value) {
					let full_url_path = full_url.path();
					let results = glob(
						format!(
							"{}/public/{}**/*.js",
							optimizer.base_dir,
							full_url_path.trim_start_matches("/")
						)
						.as_str(),
					)
					.ok();

					if let Some(paths) = results {
						for path in paths.flatten() {
							let path = path.to_string_lossy();
							let relative_key = path.trim_start_matches(
								format!("{}/public", optimizer.base_dir).trim_start_matches("./"),
							);
							let relative_path = path.trim_start_matches(
								format!(
									"{}/public/{}",
									optimizer.base_dir,
									full_url_path.trim_start_matches("/")
								)
								.trim_start_matches("./"),
							);

							new_imports.insert(
								format!("{key}{relative_path}"),
								optimizer.get_url(format!("{value}{relative_path}").as_str(), true),
							);
							new_imports.insert(
								relative_key.to_string(),
								optimizer.get_url(format!("{value}{relative_path}").as_str(), true),
							);
						}
					}
				}

				new_imports.insert(key.to_owned(), value.to_owned());
			} else {
				new_imports.insert(key.to_owned(), optimizer.get_url(&value, true));
			}
		}

		self.imports = new_imports;

		self
	}

	fn resolve(&self, specifier: String, base: &str) -> String {
		let mut specifier = specifier;

		if !specifier.starts_with("./")
			&& !specifier.starts_with("../")
			&& !specifier.starts_with("/")
		{
			for (key, path) in self.imports.clone() {
				if specifier.starts_with(&key) {
					let new_specifier = specifier.trim_start_matches(&key);

					specifier = path + new_specifier;

					break;
				}
			}
		}

		let base = Url::parse("https://0.0.0.0")
			.expect("should be a url")
			.join(base)
			.expect("should be a url");
		let specifier = base.join(specifier.as_str()).expect("should be a url");
		let specifier = specifier.path();

		specifier.to_string()
	}
}

pub struct Optimizer {
	base_dir: String,
	url: Url,
}

const PRELOAD_MODULES_COMMENT: &str = "<!-- preloadmodules -->";

impl Optimizer {
	pub fn rewrite_assets(&self, bytes: &Bytes) -> anyhow::Result<Vec<u8>> {
		let mut output = Vec::new();
		let mut import_map = ImportMap::default();
		let mut modules = Vec::new();
		let mut module_blocks = Vec::new();
		let mut rewriter = HtmlRewriter::new(
			Settings {
				element_content_handlers: [
					element!("head", |el| {
						let url = self.get_url("/favicon.svg", true);

						el.append(
							format!(r#"<link rel="icon" href="{url}" type="image/svg+xml" />"#)
								.as_str(),
							ContentType::Html,
						);

						Ok(())
					}),
					element!(
						"link[href][rel='stylesheet'], link[href][rel='icon']",
						|el| {
							if let Some(href) = el.get_attribute("href") {
								el.set_attribute(
									"href",
									self.get_url(href.as_str(), true).as_str(),
								)
								.ok();
							}

							Ok(())
						}
					),
					element!("script[src]", |el| {
						if let Some(src) = el.get_attribute("src") {
							let url = self.get_url(src.as_str(), false);

							if let Some(t) = el.get_attribute("type") {
								if t == "module" {
									modules.push(url.clone());
								}
							}

							let url = self.get_url(src.as_str(), true);

							el.set_attribute("src", url.as_str()).ok();
						}

						Ok(())
					}),
					text!("script[type='module']", |el| {
						module_blocks.push(el.as_str().to_string());

						Ok(())
					}),
					text!("script[type='importmap']", |el| {
						if let Ok(mut im) = json::from_str::<ImportMap>(el.as_str()) {
							import_map = im.clone();

							im.map(self);

							if let Ok(map) = json::to_string(&im) {
								el.replace(map.as_str(), ContentType::Text);
							}
						}

						Ok(())
					}),
					element!("script[type='importmap']", |el| {
						el.after(PRELOAD_MODULES_COMMENT, ContentType::Html);

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

		let mut preload_modules: BTreeSet<String> = BTreeSet::new();

		for module in modules.clone() {
			preload_modules.insert(module);
		}

		for block in module_blocks.clone() {
			preload_modules = self.get_deps(
				self.url.to_string(),
				Some(block),
				preload_modules.clone(),
				import_map.clone(),
			);
		}

		for module in modules.clone() {
			preload_modules = self.get_deps(module, None, preload_modules, import_map.clone());
		}

		let mut preloads = String::new();

		for preload_module in preload_modules {
			let preload_module = self.get_url(preload_module.as_str(), true);

			preloads.push_str(
				format!(r#"<link rel="modulepreload" href="{}" />"#, preload_module).as_str(),
			);
		}

		let output = String::from_utf8(output.to_vec()).expect("should be a string");
		let output = output.replace(PRELOAD_MODULES_COMMENT, preloads.as_str());

		Ok(output.into())
	}

	pub fn get_deps(
		&self,
		url: String,
		body: Option<String>,
		found: BTreeSet<String>,
		import_map: ImportMap,
	) -> BTreeSet<String> {
		static IMPORT_REGEX: LazyLock<Regex> =
			LazyLock::new(|| Regex::new(r#"\s*import.*?('(.*?)'|"(.*?)")"#).unwrap());

		let mut results = found.clone();
		let body = body.unwrap_or_else(|| {
			let file_path = format!("{}/public/{}", self.base_dir, url.trim_start_matches("/"));

			fs::read_to_string(Utf8Path::new(file_path.as_str()).to_path_buf()).unwrap_or_default()
		});

		for (_, [_, a]) in IMPORT_REGEX.captures_iter(&body).map(|c| c.extract()) {
			let resolved = import_map.resolve(a.to_string(), &url);

			if !results.contains(&resolved) {
				results.insert(resolved.clone());

				for r in self.get_deps(resolved, None, found.clone(), import_map.clone()) {
					if !results.contains(&r) {
						results.insert(r);
					}
				}
			}
		}

		results
	}

	pub fn get_url(&self, url: &str, with_hash: bool) -> String {
		if let Ok(full_url) = self.url.join(url) {
			let full_url_path = full_url.path();
			let file_path = format!(
				"{}/public/{}",
				self.base_dir,
				full_url_path.trim_start_matches("/")
			);

			if with_hash {
				if let Ok(body) =
					fs::read_to_string(Utf8Path::new(file_path.as_str()).to_path_buf())
				{
					let hash = md5::compute(body.as_bytes());
					let mut new_ext = format!("{hash:?}")[0..10].to_string();
					let path = Utf8Path::new(full_url_path);

					if let Some(ext) = path.extension() {
						new_ext = format!("{new_ext}.{ext}");
					}

					let path = path.with_extension(new_ext);

					return path.to_string();
				}
			}

			return full_url_path.to_string();
		};

		url.to_string()
	}
}
