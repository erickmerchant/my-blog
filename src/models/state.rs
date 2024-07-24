use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Default, Serialize, PartialOrd, Ord, PartialEq, Eq)]
pub enum State {
	#[serde(rename = "draft")]
	#[default]
	Draft,

	#[serde(rename = "published")]
	Published(NaiveDate),

	#[serde(rename = "pinned")]
	Pinned,
}
