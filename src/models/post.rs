use super::status::Status;
use crate::FileSystem;
use camino::Utf8Path;
use serde::Deserialize;

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize)]
pub struct Entry {
	pub slug: Option<String>,
	pub title: String,
	pub status: Option<Status>,
	pub content: Option<String>,
}

pub struct Model {
	pub fs: FileSystem,
}

impl Model {
	pub async fn all(&self) -> Vec<Entry> {
		let mut all = vec![];
		let paths = self.fs.clone().list("posts".to_string()).await.ok();

		if let Some(paths) = paths {
			for path in paths {
				let path = Utf8Path::new(path.as_str());

				if let Some(slug) = path.file_stem() {
					if let Some(model) = self.by_slug(slug).await {
						all.push(model);
					}
				}
			}
		}

		let mut all: Vec<Entry> = all
			.iter()
			.filter(|e| e.status.is_some())
			.map(|e| e.to_owned())
			.collect();

		all.sort_by(|a, b| {
			let cmp = b.status.cmp(&a.status);

			if let (Some(Status::Published(a)), Some(Status::Published(b))) = (&a.status, &b.status)
			{
				b.cmp(a)
			} else {
				cmp
			}
		});

		all
	}

	pub async fn by_slug(&self, slug: &str) -> Option<Entry> {
		self.fs
			.clone()
			.read(format!("posts/{slug}.md"))
			.await
			.ok()
			.map(|contents| {
				let parts = if contents.starts_with("+++") {
					let parts: Vec<_> = contents.splitn(3, "+++").collect();

					Some(parts)
				} else {
					None
				};

				let mut model: Entry;

				if let Some([_, frontmatter, contents]) = parts.as_deref() {
					model = toml::from_str(frontmatter).unwrap_or_default();

					model.content = Some(contents.to_string());
				} else {
					model = Entry {
						content: Some(contents),
						..Default::default()
					}
				}

				model.slug = Some(slug.to_string());

				model
			})
	}
}
