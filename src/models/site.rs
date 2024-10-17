use crate::filesystem::*;
use anyhow::Result;
use camino::Utf8Path;
use serde::Deserialize;

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
	pub async fn read(base_dir: &str) -> Result<Self> {
		let toml = read(Utf8Path::new(&base_dir).join("content/site.toml")).await?;
		let site = toml::from_str(&toml)?;

		Ok(site)
	}
}
