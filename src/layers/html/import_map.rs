use super::optimizer::Optimizer;
use glob::glob;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use url::Url;

type Imports = BTreeMap<String, String>;

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ImportMap {
	pub imports: Imports,
}

impl ImportMap {
	pub fn map(&mut self, optimizer: &Optimizer) -> &Self {
		let mut new_imports = Imports::new();

		for (key, value) in &self.imports {
			if value.ends_with("/") {
				if let Ok(full_url) = optimizer.url.join(value) {
					let full_url_path = full_url.path();
					let results = glob(
						optimizer
							.get_public_path((full_url_path.to_string() + "**/*.js").as_str())
							.as_str(),
					)
					.ok();

					if let Some(paths) = results {
						for path in paths.flatten() {
							let path = path.to_string_lossy();
							let relative_key = path.trim_start_matches(
								optimizer.get_public_directory().trim_start_matches("./"),
							);
							let relative_path = path.trim_start_matches(
								optimizer
									.get_public_path(full_url_path)
									.trim_start_matches("./"),
							);

							new_imports.insert(
								key.to_string() + relative_path,
								optimizer
									.get_url((value.to_owned() + relative_path).as_str(), true),
							);
							new_imports.insert(
								relative_key.to_string(),
								optimizer
									.get_url((value.to_owned() + relative_path).as_str(), true),
							);
						}
					}
				}

				new_imports.insert(key.to_owned(), value.to_owned());
			} else {
				new_imports.insert(key.to_owned(), optimizer.get_url(value, true));
			}
		}

		self.imports = new_imports;

		self
	}

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
