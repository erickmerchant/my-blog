use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs::read_to_string;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Resume {
	pub name: String,
	pub contacts: Option<ContactList>,
	pub objective: String,
	pub history: TimeLine,
	pub education: TimeLine,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Contact {
	pub href: String,
	pub text: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct TimeLineItem {
	pub title: String,
	#[serde(default)]
	pub latest_full_time: bool,
	pub dates: (String, String),
	pub tags: Option<Vec<String>>,
	pub organization: Option<String>,
	pub location: Option<String>,
	pub summary: String,
}

type ContactList = Vec<Contact>;
type TimeLine = Vec<TimeLineItem>;

impl super::Model {
	pub async fn resume(&self) -> Result<Resume> {
		let content = read_to_string(
			self.base_dir.trim_end_matches("/").to_string() + "/content/resume.toml",
		)?;
		let resume = toml::from_str(&content)?;

		Ok(resume)
	}
}
