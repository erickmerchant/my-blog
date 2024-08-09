use super::state;
use camino::Utf8Path;
use glob::glob;
use pulldown_cmark::{html, CodeBlockKind, CowStr, Event, Tag, TagEnd};
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Model {
	#[serde(default)]
	pub slug: String,

	pub title: String,

	#[serde(default)]
	pub state: state::State,
	pub content: Option<String>,
}

impl Model {
	pub fn load_all(include_content: bool) -> Vec<Self> {
		let mut all = vec![];
		let results = glob("content/posts/*.md").ok();

		if let Some(paths) = results {
			for path in paths.flatten() {
				if let Some(slug) = path.file_stem().and_then(|s| s.to_str()) {
					if let Some(model) = Self::load_by_slug(slug, include_content) {
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

	pub fn load_by_slug(slug: &str, include_content: bool) -> Option<Self> {
		fs::read_to_string(
			Utf8Path::new("content/posts")
				.join(slug)
				.with_extension("md"),
		)
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
					let parser = pulldown_cmark::Parser::new(contents);
					let mut events = Vec::new();
					let mut code_block_text = None;

					for event in parser {
						match event {
							Event::Start(Tag::CodeBlock(lang)) => {
								code_block_text = match lang {
									CodeBlockKind::Fenced(_) => Some(String::new()),
									_ => None,
								};
							}
							Event::End(TagEnd::CodeBlock) => {
								if let Some(text) = &code_block_text {
									let mut lines = Vec::new();
									let inner_html = text;

									for line in inner_html.trim().lines() {
										lines.push(format!(
											"<code>{}</code>",
											html_escape::encode_text(line)
										));
									}

									let hightlighted_html = format!(
										r#"<figure><pre>{}</pre></figure>"#,
										lines.join("\n")
									);

									events.push(Event::Html(CowStr::Boxed(
										hightlighted_html.into_boxed_str(),
									)));
									code_block_text = None;
								}
							}
							Event::Text(t) => {
								if let Some(text) = code_block_text.as_mut() {
									text.push_str(&t);
								} else {
									events.push(Event::Text(t))
								}
							}
							e => {
								events.push(e);
							}
						}
					}

					let mut markdown = String::new();

					html::push_html(&mut markdown, events.into_iter());

					Some(markdown)
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
