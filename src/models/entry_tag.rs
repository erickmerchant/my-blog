use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "entry_tag")]
pub struct Model {
	#[sea_orm(primary_key)]
	#[serde(skip_deserializing)]
	pub entry_id: i32,

	#[sea_orm(primary_key)]
	#[serde(skip_deserializing)]
	pub tag_id: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
	#[sea_orm(
		belongs_to = "super::entry::Entity",
		from = "Column::EntryId",
		to = "super::entry::Column::Id"
	)]
	Entry,
	#[sea_orm(
		belongs_to = "super::tag::Entity",
		from = "Column::TagId",
		to = "super::tag::Column::Id"
	)]
	Tag,
}

impl ActiveModelBehavior for ActiveModel {}
