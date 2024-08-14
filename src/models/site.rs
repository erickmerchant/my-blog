use anyhow::Result;
use serde::Deserialize;
use tokio::fs;

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize)]
pub struct Project {
	pub href: String,
	pub title: String,
	pub description: String,
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize)]
pub struct Model {
	pub title: String,
	pub host: String,
	pub author: String,
	pub description: String,
	pub bio: String,
	pub projects: Vec<Project>,
}

impl Model {
	pub async fn load() -> Result<Self> {
		let toml = fs::read_to_string("content/site.toml").await?;
		let site = toml::from_str::<Self>(&toml)?;

		Ok(site)
	}
}
