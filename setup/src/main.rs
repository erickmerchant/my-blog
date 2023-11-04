mod content;
mod frontmatter;
mod schema;

use anyhow::Result;
use app::DATABASE_URL;
use content::import_content;
use schema::create_schema;
use sea_orm::Database;
use std::fs;

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
