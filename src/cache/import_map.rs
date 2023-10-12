use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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
