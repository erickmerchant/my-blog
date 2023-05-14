use crate::state::AppState;
use etag::EntityTag;
use sea_orm::entity::prelude::*;
use sea_orm::ActiveValue::Set;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "cache")]
pub struct Model {
	#[sea_orm(primary_key)]
	#[serde(skip_deserializing)]
	pub id: i32,
	pub path: String,
	pub etag: String,
	pub content_type: String,
	pub body: Vec<u8>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

pub async fn save(
	app_state: &AppState,
	path: String,
	content_type: String,
	body: Vec<u8>,
) -> String {
	let etag = EntityTag::from_data(&body).to_string();

	if !envmnt::is("NO_CACHE") {
		let cache_model = ActiveModel {
			path: Set(path.clone()),
			content_type: Set(content_type.clone()),
			etag: Set(etag.clone()),
			body: Set(body.clone()),
			..Default::default()
		};

		cache_model.clone().insert(&app_state.database).await.ok();
	};

	etag
}
