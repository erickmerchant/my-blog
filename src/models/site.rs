use anyhow::Result;
use camino::Utf8Path;
use serde::Deserialize;
use std::fs::read_to_string;

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize)]
pub struct Project {
	pub href: String,
	pub title: String,
	pub description: String,
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize)]
pub struct Site {
	pub title: String,
	pub host: String,
	pub author: String,
	pub description: String,
	pub bio: String,
	pub projects: Vec<Project>,
}

impl super::Model {
	pub async fn site(&self) -> Result<Site> {
		let toml = read_to_string(Utf8Path::new(&self.base_dir).join("content/site.toml"))?;
		let site = toml::from_str(&toml)?;

		Ok(site)
	}
}
