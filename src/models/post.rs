use camino::Utf8Path;
use chrono::NaiveDate;
use serde::Deserialize;
use std::fs::{read_dir, read_to_string};

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize)]
pub struct Model {
	pub slug: Option<String>,
	pub title: String,
	pub date_published: Option<NaiveDate>,
	pub content: Option<String>,
}

impl Model {
	pub async fn all(base_dir: &str) -> Vec<Self> {
		let mut all = Vec::new();
		let results = read_dir(Utf8Path::new(&base_dir).join("content/posts")).ok();

		if let Some(paths) = results {
			for path in paths.flatten() {
				let path = path.path();

				if let Some(Some(slug)) =
					Utf8Path::from_path(path.as_path()).map(|path| path.file_stem())
				{
					if let Some(model) = Self::by_slug(base_dir, slug).await {
						all.push(model);
					}
				}
			}
		}

		let mut all: Vec<Self> = all
			.iter()
			.filter(|e| e.date_published.is_some())
			.map(|e| e.to_owned())
			.collect();

		all.sort_by(|a, b| {
			let cmp = b.date_published.cmp(&a.date_published);

			if let (Some(a), Some(b)) = (&a.date_published, &b.date_published) {
				b.cmp(a)
			} else {
				cmp
			}
		});

		all
	}

	pub async fn by_slug(base_dir: &str, slug: &str) -> Option<Self> {
		read_to_string(Utf8Path::new(&base_dir).join(format!("content/posts/{slug}.md")))
			.ok()
			.map(|contents| {
				let parts = if contents.starts_with("+++") {
					let parts: Vec<_> = contents.splitn(3, "+++").collect();

					Some(parts)
				} else {
					None
				};

				let mut model: Self;

				if let Some([_, frontmatter, contents]) = parts.as_deref() {
					model = toml::from_str(frontmatter).unwrap_or_default();

					model.content = Some(contents.to_string());
				} else {
					model = Self {
						content: Some(contents),
						..Default::default()
					}
				}

				model.slug = Some(slug.to_string());

				model
			})
	}
}
