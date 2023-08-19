use anyhow::Result;
use app::{setup::create_schema::*, setup::import_content::*};
use sea_orm::Database;
use std::fs;

#[tokio::main]
async fn main() -> Result<()> {
	fs::remove_dir_all("storage").ok();
	fs::create_dir_all("storage")?;

	let connection = Database::connect("sqlite://./storage/content.db?mode=rwc")
		.await
		.expect("database should connect");

	create_schema(&connection).await?;
	import_content(&connection).await?;

	Ok(())
}
