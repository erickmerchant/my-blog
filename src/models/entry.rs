use super::tag;
use chrono::NaiveDate;
use sea_orm::entity::prelude::*;
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

impl From<(Model, Vec<tag::Model>)> for TaggedEntry {
	fn from((entry, tag_list): (Model, Vec<tag::Model>)) -> Self {
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

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "entry")]
pub struct Model {
	#[sea_orm(primary_key)]
	#[serde(skip_deserializing)]
	pub id: i32,

	pub slug: String,

	#[serde(default)]
	pub title: Option<String>,

	#[serde(default)]
	pub date: Option<NaiveDate>,

	#[serde(skip_deserializing, default)]
	pub content: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

impl Related<super::tag::Entity> for Entity {
	fn to() -> RelationDef {
		super::entry_tag::Relation::Tag.def()
	}

	fn via() -> Option<RelationDef> {
		Some(super::entry_tag::Relation::Entry.def().rev())
	}
}

#[derive(EnumIter, DeriveActiveEnum)]
#[sea_orm(rs_type = "String", db_type = "Text")]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Eq)]
pub enum FeedType {
	#[sea_orm(string_value = "Category")]
	Category,
	#[sea_orm(string_value = "Tag")]
	Tag,
}
