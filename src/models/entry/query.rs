use super::{order::Order, sort::Sort, Column, Entity, Model};
use sea_orm::{entity::prelude::*, query::*, DatabaseConnection, FromJsonQueryResult};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, FromJsonQueryResult)]
pub struct Query {
	pub category: String,
	#[serde(default)]
	pub has_date: bool,
	#[serde(default)]
	pub order: Option<Order>,
	#[serde(default)]
	pub sort: Option<Sort>,
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

		if let (Some(sort), Some(order)) = (self.sort.clone(), self.order.clone()) {
			let col = match sort {
				Sort::Slug => Column::Slug,
				Sort::Title => Column::Title,
				Sort::Date => Column::Date,
			};

			match order {
				Order::Desc => {
					query = query.order_by_desc(col);
				}
				Order::Asc => {
					query = query.order_by_asc(col);
				}
			}
		};

		self.results = Some(query.all(database).await?);

		Ok(())
	}
}
