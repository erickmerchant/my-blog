use crate::models::{cache, entry, entry_tag, tag};
use anyhow::Result;
use sea_orm::{sea_query::Index, ConnectionTrait, DatabaseConnection, Schema};
use tokio::try_join;

pub async fn create_schema(connection: &DatabaseConnection) -> Result<()> {
	let backend = connection.get_database_backend();
	let schema = Schema::new(backend);

	try_join!(
		connection.execute(backend.build(&schema.create_table_from_entity(entry::Entity))),
		connection.execute(backend.build(&schema.create_table_from_entity(tag::Entity))),
		connection.execute(backend.build(&schema.create_table_from_entity(entry_tag::Entity))),
		connection.execute(
			backend.build(
				Index::create()
					.name("entry-slug-unique")
					.table(entry::Entity)
					.col(entry::Column::Slug)
					.unique()
			)
		),
		connection.execute(backend.build(&schema.create_table_from_entity(cache::Entity))),
	)?;

	Ok(())
}
