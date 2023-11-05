use super::import_map::ImportMap;
use camino::Utf8Path;
use hyper::body::Bytes;
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use serde_json as json;
use std::{fs, time::UNIX_EPOCH};

pub fn rewrite_assets(bytes: Bytes, mut output: Vec<u8>) -> anyhow::Result<Vec<u8>> {
	let mut rewriter = HtmlRewriter::new(
		Settings {
			element_content_handlers: vec![
				element!("link[href]", |el| {
					if let Some(href) = el.get_attribute("href") {
						el.set_attribute("href", asset_url(href).as_str()).ok();
					}

					Ok(())
				}),
				element!("script[src]", |el| {
					if let Some(src) = el.get_attribute("src") {
						el.set_attribute("src", asset_url(src).as_str()).ok();
					}

					Ok(())
				}),
				text!("script[type='importmap']", |el| {
					if let Ok(mut import_map) = json::from_str::<ImportMap>(el.as_str()) {
						import_map.map(asset_url);

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

fn asset_url(url: String) -> String {
	if url.starts_with('/') {
		if let Some(bare_url) = url.strip_prefix('/') {
			if let Ok(time) = fs::metadata(Utf8Path::new("public").join(bare_url))
				.and_then(|meta| meta.modified())
			{
				let version_time = time
					.duration_since(UNIX_EPOCH)
					.map(|d| d.as_secs())
					.expect("time should be a valid time since the unix epoch");
				let cache_key = base62::encode(version_time);
				let path = Utf8Path::new(&url);
				let ext = path.extension().unwrap_or_default();

				return path
					.with_extension(format!("{cache_key}.{ext}"))
					.to_string();
			}
		}
	};

	url
}
