use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "tags")]
pub struct Model {
	#[sea_orm(primary_key)]
	#[serde(skip_deserializing)]
	pub id: i32,

	#[sea_orm(unique)]
	pub slug: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

impl Related<super::entry::Entity> for Entity {
	fn to() -> RelationDef {
		super::entry_tag::Relation::Entry.def()
	}

	fn via() -> Option<RelationDef> {
		Some(super::entry_tag::Relation::Tag.def().rev())
	}
}
