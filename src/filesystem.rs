use anyhow::Result;
use camino::{Utf8Path, Utf8PathBuf};
use std::time::SystemTime;
use tokio::fs;

pub async fn list(path: Utf8PathBuf) -> Result<Vec<String>> {
	let mut all = Vec::new();
	let results = fs::read_dir(path).await.ok();

	if let Some(paths) = results {
		let mut paths = paths;

		while let Ok(Some(path)) = paths.next_entry().await {
			let path = path.path();
			if let Some(path) = Utf8Path::from_path(path.as_path()) {
				if let Some(slug) = path.file_stem() {
					all.push(slug.to_string());
				}
			}
		}
	}

	Ok(all)
}

pub async fn read(path: Utf8PathBuf) -> Result<Vec<u8>> {
	Ok(fs::read(&path).await?)
}

pub async fn read_to_string(path: Utf8PathBuf) -> Result<String> {
	Ok(fs::read_to_string(&path).await?)
}

pub fn modified(path: Utf8PathBuf) -> Result<SystemTime> {
	let meta = std::fs::metadata(path)?;

	Ok(meta.modified()?)
}
