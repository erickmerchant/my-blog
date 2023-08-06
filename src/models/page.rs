use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "pages")]
pub struct Model {
	#[sea_orm(primary_key)]
	#[serde(skip_deserializing)]
	pub id: i32,

	#[sea_orm(unique)]
	#[serde(skip_deserializing)]
	pub slug: String,

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
	pub elements: super::elements::Elements,

	#[serde(default)]
	pub redirect: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
