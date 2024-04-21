use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Model {
	pub title: String,

	pub date: NaiveDate,

	#[serde(default)]
	pub pinned: bool,
}
