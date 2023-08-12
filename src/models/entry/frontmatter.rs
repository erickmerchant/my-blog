use super::{query, tags};
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Frontmatter {
	#[serde(default)]
	pub title: Option<String>,

	#[serde(default)]
	pub description: Option<String>,

	#[serde(default)]
	pub permalink: Option<String>,

	#[serde(default)]
	pub template: Option<String>,

	#[serde(default)]
	pub date: Option<NaiveDate>,

	#[serde(default)]
	pub query: Option<query::Query>,

	#[serde(default)]
	pub tags: Option<tags::Tags>,
}
