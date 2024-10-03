use crate::filesystem::FileSystem;
use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Entry {
	pub name: String,
	pub contacts: Option<ContactList>,
	pub skills: SkillList,
	pub history: TimeLine,
	pub education: TimeLine,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Contact {
	pub href: String,
	pub text: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TimeLineItem {
	pub title: String,
	pub time: String,
	pub organization: Option<String>,
	pub location: Option<String>,
	pub details: DetailList,
}

pub type ContactList = Vec<Contact>;
pub type SkillList = String;
pub type TimeLine = Vec<TimeLineItem>;
pub type DetailList = String;

pub struct Model {
	pub fs: FileSystem,
}

impl Model {
	pub async fn read(&self) -> Result<Entry> {
		let content = self.fs.clone().read("resume.toml".to_string()).await?;

		let resume = toml::from_str(&content)?;

		Ok(resume)
	}
}
