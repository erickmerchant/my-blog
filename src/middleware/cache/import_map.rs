use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ImportMap {
	#[serde(default)]
	pub imports: HashMap<String, String>,
	#[serde(default)]
	pub scopes: HashMap<String, HashMap<String, String>>,
}
