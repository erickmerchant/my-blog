use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Frontmatter {
	#[serde(default)]
	pub title: Option<String>,

	#[serde(default)]
	pub date: Option<NaiveDate>,
}
