use super::import_map::ImportMap;
use camino::Utf8Path;
use hyper::body::Bytes;
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use serde_json as json;
use std::{collections::BTreeSet, fs};
use url::Url;

const PRELOAD_MODULES_COMMENT: &str = "<!-- preloadmodules -->";

pub struct Rewriter {
	pub base_dir: String,
	pub url: Url,
}

impl Rewriter {
	pub fn rewrite(&self, bytes: &Bytes) -> anyhow::Result<Vec<u8>> {
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
							let url = self.get_url(src.as_str(), true);

							el.set_attribute("src", url.as_str()).ok();

							let url = self.get_url(src.as_str(), false);

							if let Some(t) = el.get_attribute("type") {
								if t == "module" {
									if modules.contains(&url) {
										el.remove();
									} else {
										modules.push(url);
									}
								}
							}
						}

						Ok(())
					}),
					text!("script[type='module']", |el| {
						module_blocks.push(el.as_str().to_string());

						Ok(())
					}),
					text!("script[type='importmap']", |el| {
						if let Ok(im) = json::from_str::<ImportMap>(el.as_str()) {
							import_map = im.clone();

							let im = self.map_imports(im);

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

		for module in &modules {
			preload_modules.insert(module.to_owned());
		}

		for block in module_blocks {
			preload_modules = self.get_dependencies(
				&import_map,
				self.url.to_string(),
				Some(block),
				preload_modules,
			);
		}

		for module in modules {
			preload_modules = self.get_dependencies(&import_map, module, None, preload_modules);
		}

		let mut preloads = String::new();

		for preload_module in preload_modules {
			let preload_module = self.get_url(preload_module.as_str(), true);

			preloads.push_str(
				format!(r#"<link rel="modulepreload" href="{}" />"#, preload_module).as_str(),
			);
		}

		let output = String::from_utf8(output.to_vec()).unwrap_or_default();
		let output = output.replace(PRELOAD_MODULES_COMMENT, preloads.as_str());

		Ok(output.into())
	}

	pub fn get_public_path(&self, path: &str) -> String {
		self.get_public_directory() + "/" + path.trim_start_matches("/")
	}

	pub fn get_public_directory(&self) -> String {
		self.base_dir.trim_end_matches("/").to_string() + "/public"
	}

	pub fn get_url(&self, url: &str, with_hash: bool) -> String {
		if let Ok(full_url) = self.url.join(url) {
			let full_url_path = full_url.path();
			let file_path = self.get_public_path(full_url_path);

			if with_hash {
				if let Ok(body) = fs::read_to_string(file_path.as_str()) {
					let hash = md5::compute(body.as_bytes());
					let mut new_ext = format!("{hash:?}")[0..10].to_string();
					let path = Utf8Path::new(full_url_path);

					if let Some(ext) = path.extension() {
						new_ext = new_ext + "." + ext;
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
