use sea_orm::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(EnumIter, DeriveActiveEnum)]
#[sea_orm(rs_type = "String", db_type = "Text")]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Eq)]
pub enum Feed {
	#[sea_orm(string_value = "Category")]
	Category,
	#[sea_orm(string_value = "Tag")]
	Tag,
}
