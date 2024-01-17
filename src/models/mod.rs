pub mod cache;
pub mod entry;
pub mod entry_tag;
pub mod tag;

use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use std::convert::From;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TaggedEntry {
	pub id: i32,
	pub slug: String,
	pub title: Option<String>,
	pub date: Option<NaiveDate>,
	pub content: String,
	pub tags: Vec<tag::Model>,
}

impl From<(entry::Model, Vec<tag::Model>)> for TaggedEntry {
	fn from((entry, tag_list): (entry::Model, Vec<tag::Model>)) -> Self {
		Self {
			id: entry.id,
			slug: entry.slug.to_owned(),
			title: entry.title.to_owned(),
			date: entry.date.to_owned(),
			content: entry.content.to_owned(),
			tags: tag_list.to_owned(),
		}
	}
}
