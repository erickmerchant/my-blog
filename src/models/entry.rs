mod elements;
mod order;
mod query;
mod sort;

use chrono::NaiveDate;
pub use elements::Elements;
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

	#[sea_orm(default_value = "Untitled")]
	#[serde(default)]
	pub title: String,

	#[sea_orm(default_value = "")]
	#[serde(default)]
	pub description: String,

	#[sea_orm(default_value = "")]
	#[serde(default)]
	pub content: String,

	#[sea_orm(default_value = "[]")]
	#[serde(skip_deserializing)]
	pub elements: Elements,

	#[serde(default)]
	#[sea_orm(unique)]
	pub permalink: Option<String>,

	#[serde(default)]
	pub template: Option<String>,

	#[serde(default)]
	pub date: Option<NaiveDate>,

	#[serde(default)]
	pub query: Option<query::Query>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
