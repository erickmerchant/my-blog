use super::tag;
use chrono::NaiveDate;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TaggedEntry {
	pub id: i32,
	pub slug: String,
	pub title: Option<String>,
	pub date: Option<NaiveDate>,
	pub content: String,
	pub tags: Vec<tag::Model>,
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
