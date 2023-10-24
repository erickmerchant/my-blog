use crate::models::entry;
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Frontmatter {
	#[serde(default)]
	pub title: Option<String>,

	#[serde(default)]
	pub permalink: Option<String>,

	#[serde(default)]
	pub template: Option<String>,

	#[serde(default)]
	pub date: Option<NaiveDate>,

	#[serde(default)]
	pub tags: Option<Vec<String>>,

	#[serde(default)]
	pub feed_type: Option<entry::FeedType>,
}
