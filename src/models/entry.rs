pub mod elements;
pub mod frontmatter;
mod order;
mod query;
mod sort;
pub mod tags;

use chrono::NaiveDate;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "entries")]
pub struct Model {
	#[sea_orm(primary_key)]
	#[serde(skip_deserializing)]
	pub id: i32,

	#[serde(skip_deserializing)]
	pub slug: String,

	#[serde(skip_deserializing)]
	pub category: String,

	#[serde(skip_deserializing)]
	#[serde(default)]
	pub content: String,

	#[serde(skip_deserializing)]
	#[sea_orm(default_value = "[]")]
	pub elements: elements::Elements,

	#[serde(default)]
	pub title: Option<String>,

	#[serde(default)]
	pub description: Option<String>,

	#[sea_orm(unique)]
	#[serde(default)]
	pub permalink: Option<String>,

	#[serde(default)]
	pub template: Option<String>,

	#[serde(default)]
	pub date: Option<NaiveDate>,

	#[serde(default)]
	pub query: Option<query::Query>,

	#[serde(default)]
	pub tags: Option<tags::Tags>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
