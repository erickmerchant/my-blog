use crate::filesystem::FileSystem;
use anyhow::Result;
use serde::Deserialize;

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize)]
pub struct Project {
	pub href: String,
	pub title: String,
	pub description: String,
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize)]
pub struct Entry {
	pub title: String,
	pub host: String,
	pub author: String,
	pub description: String,
	pub bio: String,
	pub projects: Vec<Project>,
}

pub struct Model {
	pub fs: FileSystem,
}

impl Model {
	pub async fn read(&self) -> Result<Entry> {
		let toml = self.fs.clone().read("site.toml".to_string()).await?;
		let site = toml::from_str(&toml)?;

		Ok(site)
	}
}
