use chrono::NaiveDate;
use serde::Deserialize;

#[derive(Clone, Debug, Deserialize, PartialOrd, Ord, PartialEq, Eq)]
pub enum Status {
	#[serde(rename = "published")]
	Published(NaiveDate),

	#[serde(rename = "pinned")]
	Pinned,
}
