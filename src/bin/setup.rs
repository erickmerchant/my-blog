mod util;

use anyhow::Result;
use app::DATABASE_URL;
use sea_orm::Database;
use std::fs;
use util::{content::import_content, schema::create_schema};

#[tokio::main]
async fn main() -> Result<()> {
	fs::remove_dir_all("storage").ok();
	fs::create_dir_all("storage")?;

	let database = Database::connect(format!("{}?mode=rwc", DATABASE_URL)).await?;

	create_schema(&database).await?;
	import_content(&database).await?;
	database.close().await?;

	Ok(())
}
