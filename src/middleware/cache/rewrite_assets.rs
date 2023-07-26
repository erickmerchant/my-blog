use super::import_map::*;
use camino::Utf8Path;
use hyper::body::Bytes;
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use serde_json as json;
use std::{collections::HashMap, fs, time::UNIX_EPOCH};

pub fn rewrite_assets(bytes: Bytes, mut output: Vec<u8>) -> anyhow::Result<Vec<u8>> {
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
	if url.starts_with('/') {
		if let Ok(time) =
			fs::metadata(Utf8Path::new("theme").join(&url[1..])).and_then(|meta| meta.modified())
		{
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
