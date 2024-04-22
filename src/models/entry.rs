use super::frontmatter;
use camino::Utf8Path;
use chrono::NaiveDate;
use glob::glob;
use pulldown_cmark::{html, CodeBlockKind, CowStr, Event, Tag, TagEnd};
use serde::{Deserialize, Serialize};
use std::{cmp::Ordering, fs};

#[derive(Debug, Deserialize, Serialize)]
pub struct Model {
	pub slug: String,

	pub title: String,

	pub date: NaiveDate,

	#[serde(default)]
	pub pinned: bool,

	pub content: Option<String>,
}

impl Model {
	pub fn find_all_frontmatter() -> Vec<Model> {
		let mut all = vec![];
		let results = glob("content/posts/*.md").ok();

		if let Some(paths) = results {
			for path in paths.flatten() {
				if let Ok(content) = fs::read_to_string(&path) {
					let (frontmatter, content) = parse_content(content, false);
					let model = Model {
						slug: path
							.file_stem()
							.expect("should have a file stem")
							.to_string_lossy()
							.to_string(),
						title: frontmatter.title.clone(),
						date: frontmatter.date,
						pinned: frontmatter.pinned,
						content,
					};

					all.push(model);
				}
			}
		}

		all.sort_by(|a, b| {
			let cmp = b.pinned.cmp(&a.pinned);

			if cmp == Ordering::Equal {
				b.date.cmp(&a.date)
			} else {
				cmp
			}
		});

		all
	}

	pub fn find_by_slug(slug: &str) -> Option<Model> {
		if let Ok(content) = fs::read_to_string(
			Utf8Path::new("content/posts")
				.join(slug)
				.with_extension("md"),
		) {
			let (frontmatter, content) = parse_content(content, true);

			return Some(Model {
				slug: slug.to_string(),
				title: frontmatter.title.clone(),
				date: frontmatter.date,
				pinned: frontmatter.pinned,
				content,
			});
		};

		None
	}
}

fn parse_content(contents: String, include_body: bool) -> (frontmatter::Model, Option<String>) {
	let parts = contents.splitn(3, "+++");

	match parts.collect::<Vec<&str>>().as_slice() {
		[_, frontmatter, contents] => {
			let frontmatter = toml::from_str::<frontmatter::Model>(frontmatter).unwrap_or_default();
			let body = if include_body {
				let parser = pulldown_cmark::Parser::new(contents);
				let mut events = Vec::new();
				let mut code_block_text = String::new();
				let mut code_block_lang = None;

				for event in parser {
					match event {
						Event::Start(Tag::CodeBlock(lang)) => {
							code_block_lang = match lang {
								CodeBlockKind::Fenced(lang) => Some(lang.into_string()),
								_ => None,
							};
						}
						Event::End(TagEnd::CodeBlock) => {
							if let Some(lang) = code_block_lang {
								let mut lines = Vec::new();
								let inner_html = code_block_text;

								for line in inner_html.trim().lines() {
									lines.push(format!(
										"<span>{}</span>",
										html_escape::encode_text(line)
									));
								}

								let hightlighted_html = format!(
									r#"<figure class="code-block" data-language="{}"><pre><code>{}</code></pre></figure>"#,
									lang,
									lines.join("\n")
								);
								events.push(Event::Html(CowStr::Boxed(
									hightlighted_html.into_boxed_str(),
								)));
								code_block_text = String::new();
								code_block_lang = None;
							}
						}
						Event::Text(t) => {
							if let Some(_lang) = code_block_lang.clone() {
								code_block_text.push_str(&t);
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

				Some(markdown.to_string())
			} else {
				None
			};

			(frontmatter, body)
		}
		_ => {
			let body = if include_body {
				Some(contents.clone())
			} else {
				None
			};

			(frontmatter::Model::default(), body)
		}
	}
}
