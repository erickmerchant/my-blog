use crate::filesystem::*;
use camino::Utf8Path;
use chrono::NaiveDate;
use serde::Deserialize;

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize)]
pub struct Model {
	pub slug: Option<String>,
	pub title: String,
	pub date_published: Option<NaiveDate>,
	pub content: Option<String>,
}

impl Model {
	pub async fn all(base_dir: &str) -> Vec<Self> {
		let mut all = vec![];
		let slugs = list(Utf8Path::new(&base_dir).join("content/posts"))
			.await
			.ok();

		if let Some(slugs) = slugs {
			for slug in slugs {
				if let Some(model) = Self::by_slug(base_dir, &slug).await {
					all.push(model);
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
			.await
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
