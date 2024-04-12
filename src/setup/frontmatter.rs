use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Frontmatter {
	pub title: String,

	pub date: NaiveDate,

	#[serde(default)]
	pub pinned: bool,
}
