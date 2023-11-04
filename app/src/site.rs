use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Site {
	#[serde(default)]
	pub title: String,

	#[serde(default)]
	pub host: String,

	#[serde(default)]
	pub author: String,

	#[serde(default)]
	pub description: String,
}
