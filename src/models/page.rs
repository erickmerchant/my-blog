use chrono::NaiveDate;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json as json;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "page")]
pub struct Model {
	#[sea_orm(primary_key)]
	#[serde(skip_deserializing)]
	pub id: i32,
	#[serde(skip_deserializing)]
	pub slug: String,
	#[serde(skip_deserializing)]
	pub category: String,
	pub title: String,
	#[serde(default)]
	pub date: Option<NaiveDate>,
	#[serde(default)]
	pub description: String,
	#[serde(default)]
	pub content: String,
	#[serde(skip_deserializing)]
	pub template: String,
	#[serde(skip_deserializing)]
	pub elements: json::Value,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
