use super::import_map::ImportMap;
use hyper::body::Bytes;
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use serde_json as json;
use std::collections::BTreeSet;
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
						let url = self.get_full_path("/favicon.svg", true);

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
									self.get_full_path(href.as_str(), true).as_str(),
								)
								.ok();
							}

							Ok(())
						}
					),
					element!("script[src]", |el| {
						if let Some(src) = el.get_attribute("src") {
							let url = self.get_full_path(src.as_str(), true);

							el.set_attribute("src", url.as_str()).ok();

							let url = self.get_full_path(src.as_str(), false);

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
			let preload_module = self.get_full_path(preload_module.as_str(), true);

			preloads.push_str(
				format!(r#"<link rel="modulepreload" href="{}" />"#, preload_module).as_str(),
			);
		}

		let output = String::from_utf8(output.to_vec()).unwrap_or_default();
		let output = output.replace(PRELOAD_MODULES_COMMENT, preloads.as_str());

		Ok(output.into())
	}
}
