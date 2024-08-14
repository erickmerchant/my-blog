use super::state;
use camino::Utf8Path;
use glob::glob;
use serde::Deserialize;
use tokio::fs;

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize)]
pub struct Model {
	#[serde(default)]
	pub slug: String,

	pub title: String,

	#[serde(default)]
	pub state: state::State,
	pub content: Option<String>,
}

impl Model {
	pub async fn load_all(include_content: bool) -> Vec<Self> {
		let mut all = vec![];
		let results = glob("content/posts/*.md").ok();

		if let Some(paths) = results {
			for path in paths.flatten() {
				if let Some(slug) = path.file_stem().and_then(|s| s.to_str()) {
					if let Some(model) = Self::load_by_slug(slug, include_content).await {
						all.push(model);
					}
				}
			}
		}

		let mut all: Vec<Self> = all
			.iter()
			.filter(|e| e.state != state::State::Draft)
			.map(|e| e.to_owned())
			.collect();

		all.sort_by(|a, b| {
			let cmp = b.state.cmp(&a.state);

			if let (state::State::Published(a), state::State::Published(b)) = (&a.state, &b.state) {
				b.cmp(a)
			} else {
				cmp
			}
		});

		all
	}

	pub async fn load_by_slug(slug: &str, include_content: bool) -> Option<Self> {
		fs::read_to_string(
			Utf8Path::new("content/posts")
				.join(slug)
				.with_extension("md"),
		)
		.await
		.ok()
		.map(|contents| {
			let parts = if contents.starts_with("+++") {
				let parts = contents.splitn(3, "+++").collect::<Vec<&str>>();

				Some(parts)
			} else {
				None
			};

			let mut model;

			if let Some([_, frontmatter, contents]) = parts.as_deref() {
				model = toml::from_str::<Self>(frontmatter).unwrap_or_default();

				let content = if include_content {
					Some(contents.to_string())
				} else {
					None
				};

				model.content = content;
			} else {
				let content = if include_content {
					Some(contents)
				} else {
					None
				};

				model = Self {
					content,
					..Default::default()
				}
			}

			model.slug = slug.to_string();

			model
		})
	}
}
