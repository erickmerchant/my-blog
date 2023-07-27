use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ImportMap {
	#[serde(default)]
	pub imports: HashMap<String, String>,
	#[serde(default)]
	pub scopes: HashMap<String, HashMap<String, String>>,
}

impl ImportMap {
	pub fn map<M: Fn(String) -> String>(&mut self, map: M) -> &Self {
		for (key, value) in self.imports.clone() {
			self.imports.insert(key, map(value));
		}

		let mut new_scopes: HashMap<String, HashMap<String, String>> = HashMap::new();
		for (scope_key, old_map) in self.scopes.clone() {
			let mut new_map: HashMap<String, String> = HashMap::new();
			for (key, value) in old_map {
				new_map.insert(key, map(value));
			}

			new_scopes.insert(scope_key, new_map);
		}

		self.scopes = new_scopes;

		self
	}
}
