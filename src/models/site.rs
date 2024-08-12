use anyhow::Result;
use serde::{Deserialize, Serialize};
use tokio::fs;

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Model {
	pub title: String,
	pub host: String,
	pub author: String,
	pub description: String,
}

impl Model {
	pub async fn load() -> Result<Self> {
		let toml = fs::read_to_string("content/site.toml").await?;
		let site = toml::from_str::<Self>(&toml)?;

		Ok(site)
	}
}
