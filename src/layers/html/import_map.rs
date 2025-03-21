use super::Rewriter;
use glob::glob;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::{
	collections::{BTreeMap, BTreeSet},
	fs,
	sync::LazyLock,
};
use url::Url;

type Imports = BTreeMap<String, String>;

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ImportMap {
	pub imports: Imports,
}

impl ImportMap {
	pub fn resolve(&self, specifier: String, base: &str) -> String {
		let mut specifier = specifier;

		if !specifier.starts_with("./")
			&& !specifier.starts_with("../")
			&& !specifier.starts_with("/")
		{
			for (key, path) in &self.imports {
				if specifier.starts_with(key) {
					let new_specifier = specifier.trim_start_matches(key);

					specifier = path.to_owned() + new_specifier;

					break;
				}
			}
		}

		if let Ok(specifier) = Url::parse("https://0.0.0.0")
			.and_then(|url| url.join(base))
			.and_then(|url| url.join(specifier.as_str()))
		{
			return specifier.path().to_string();
		}

		specifier.to_string()
	}
}

impl Rewriter {
	pub fn map_imports(&self, import_map: ImportMap) -> ImportMap {
		let mut imports = Imports::new();

		for (key, value) in &import_map.imports {
			if value.ends_with("/") {
				if let Ok(full_url) = self.url.join(value) {
					let full_url_path = full_url.path();
					let results = glob(
						self.get_public_path((full_url_path.to_string() + "**/*.js").as_str())
							.as_str(),
					)
					.ok();

					if let Some(paths) = results {
						for path in paths.flatten() {
							let path = path.to_string_lossy();
							let relative_key = path.trim_start_matches(
								self.get_public_directory().trim_start_matches("./"),
							);
							let relative_path = path.trim_start_matches(
								self.get_public_path(full_url_path).trim_start_matches("./"),
							);

							imports.insert(
								key.to_string() + relative_path,
								self.get_full_path(
									(value.to_owned() + relative_path).as_str(),
									true,
								),
							);
							imports.insert(
								relative_key.to_string(),
								self.get_full_path(
									(value.to_owned() + relative_path).as_str(),
									true,
								),
							);
						}
					}
				}

				imports.insert(key.to_owned(), value.to_owned());
			} else {
				imports.insert(key.to_owned(), self.get_full_path(value, true));
			}
		}

		ImportMap { imports }
	}

	pub fn get_dependencies(
		&self,
		import_map: &ImportMap,
		url: String,
		body: Option<String>,
		found: BTreeSet<String>,
	) -> BTreeSet<String> {
		static IMPORT_REGEX: LazyLock<Regex> =
			LazyLock::new(|| Regex::new(r#"\s*import.*?('(.*?)'|"(.*?)")"#).unwrap());

		let mut results = found.to_owned();
		let body = body.unwrap_or_else(|| {
			let file_path = self.get_public_path(url.as_str());

			fs::read_to_string(file_path.as_str()).unwrap_or_default()
		});

		for (_, [_, a]) in IMPORT_REGEX.captures_iter(&body).map(|c| c.extract()) {
			let resolved = import_map.resolve(a.to_string(), &url);

			if !results.contains(&resolved) {
				results.insert(resolved.to_owned());

				for r in self.get_dependencies(import_map, resolved, None, found.to_owned()) {
					if !results.contains(&r) {
						results.insert(r);
					}
				}
			}
		}

		results
	}
}
