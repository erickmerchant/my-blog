use crate::{
	cache,
	entry::models::{entry, entry_tag, tag},
};
use anyhow::Result;
use sea_orm::{sea_query::Index, ConnectionTrait, DatabaseConnection, Schema};
use tokio::try_join;

pub async fn create_schema(connection: &DatabaseConnection) -> Result<()> {
	let backend = connection.get_database_backend();
	let schema = Schema::new(backend);

	try_join!(
		connection.execute(
			backend
				.build(&schema.create_table_from_entity(entry::Entity))
				.to_owned(),
		),
		connection.execute(
			backend
				.build(&schema.create_table_from_entity(tag::Entity))
				.to_owned(),
		),
		connection.execute(
			backend
				.build(&schema.create_table_from_entity(entry_tag::Entity))
				.to_owned(),
		),
		connection.execute(
			backend
				.build(
					Index::create()
						.name("entry-slug-category-unique")
						.table(entry::Entity)
						.col(entry::Column::Slug)
						.col(entry::Column::Category)
						.unique()
				)
				.to_owned(),
		),
		connection.execute(
			backend
				.build(&schema.create_table_from_entity(cache::model::Entity))
				.to_owned(),
		),
	)?;

	Ok(())
}
