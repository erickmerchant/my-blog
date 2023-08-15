pub mod feed;
pub mod frontmatter;

use chrono::NaiveDate;
use sea_orm::{entity::prelude::*, FromJsonQueryResult};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "entries")]
pub struct Model {
	#[sea_orm(primary_key)]
	#[serde(skip_deserializing)]
	pub id: i32,

	pub category: String,

	pub slug: String,

	#[serde(default)]
	pub title: Option<String>,

	#[serde(default)]
	pub date: Option<NaiveDate>,

	#[serde(default)]
	pub description: Option<String>,

	#[serde(skip_deserializing, default)]
	pub content: String,

	#[sea_orm(default_value = "[]")]
	pub elements: Elements,

	#[sea_orm(unique)]
	#[serde(default)]
	pub permalink: Option<String>,

	#[serde(default)]
	pub template: Option<String>,

	#[serde(default)]
	pub feed: Option<feed::Feed>,
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

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize, FromJsonQueryResult)]
pub struct Elements(pub Vec<String>);
