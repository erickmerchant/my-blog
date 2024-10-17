use crate::filesystem::*;
use anyhow::Result;
use camino::Utf8Path;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Model {
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

impl Model {
	pub async fn read(base_dir: &str) -> Result<Self> {
		let content = read(Utf8Path::new(&base_dir).join("content/resume.toml")).await?;
		let resume = toml::from_str(&content)?;

		Ok(resume)
	}
}
