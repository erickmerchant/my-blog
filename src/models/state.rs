use chrono::NaiveDate;
use serde::Deserialize;

#[derive(Clone, Debug, Deserialize, Default, PartialOrd, Ord, PartialEq, Eq)]
pub enum State {
	#[serde(rename = "draft")]
	#[default]
	Draft,

	#[serde(rename = "published")]
	Published(NaiveDate),

	#[serde(rename = "pinned")]
	Pinned,
}
