use chrono::NaiveDate;
use sea_orm::{entity::prelude::*, query::*, DatabaseConnection, FromJsonQueryResult};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize, FromJsonQueryResult)]
pub struct Elements(pub Vec<String>);

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
	pub query: Option<Query>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, FromJsonQueryResult)]
pub struct Query {
	pub category: String,
	#[serde(default)]
	pub has_date: bool,
	#[serde(default)]
	pub order: Option<Order>,
	#[serde(default)]
	pub results: Option<Vec<Model>>,
}

impl Query {
	pub async fn run(&mut self, database: &DatabaseConnection) -> anyhow::Result<()> {
		let mut conditions = Condition::all().add(Column::Category.eq(self.category.clone()));

		if self.has_date {
			conditions = conditions.add(Column::Date.is_not_null());
		}

		let mut query = Entity::find().filter(conditions);

		if let Some(order) = self.order.clone() {
			match order {
				Order::DESC => {
					query = query.order_by_desc(Column::Date);
				}
				Order::ASC => {
					query = query.order_by_asc(Column::Date);
				}
			}
		};

		self.results = Some(query.all(database).await?);

		Ok(())
	}
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum Order {
	DESC,
	ASC,
}
