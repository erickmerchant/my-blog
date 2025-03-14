use anyhow::Result;
use camino::Utf8Path;
use serde::{Deserialize, Serialize};
use std::fs::read_to_string;

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

impl super::Model {
	pub async fn resume(&self) -> Result<Model> {
		let content = read_to_string(Utf8Path::new(&self.base_dir).join("content/resume.toml"))?;
		let resume = toml::from_str(&content)?;

		Ok(resume)
	}
}
