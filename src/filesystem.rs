use anyhow::Result;
use camino::Utf8Path;
use std::time::SystemTime;
use tokio::fs;

#[derive(Clone)]
pub struct FileSystem {
	pub directory: String,
}

impl FileSystem {
	pub async fn list(self, path: String) -> Result<Vec<String>> {
		let path = Utf8Path::new(&self.directory.clone()).join(path);
		let mut all = vec![];
		let results = fs::read_dir(path).await.ok();

		if let Some(paths) = results {
			let mut paths = paths;

			while let Ok(Some(path)) = paths.next_entry().await {
				let path = path.path().to_string_lossy().to_string();

				all.push(path);
			}
		}

		Ok(all)
	}

	pub async fn read(self, path: String) -> Result<String> {
		let path = Utf8Path::new(&self.directory.clone()).join(path);

		Ok(fs::read_to_string(&path).await?)
	}

	pub async fn write(&mut self, path: String, content: String) -> Result<()> {
		let path = Utf8Path::new(&self.directory.clone()).join(path);

		fs::create_dir_all(path.with_file_name("")).await.ok();

		Ok(fs::write(path, &content).await?)
	}

	pub fn modified(self, path: String) -> Result<SystemTime> {
		let path = Utf8Path::new(&self.directory.clone()).join(path);

		let meta = std::fs::metadata(path)?;

		Ok(meta.modified()?)
	}
}
