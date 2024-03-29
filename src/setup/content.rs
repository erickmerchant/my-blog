use super::frontmatter::Frontmatter;
use crate::models::{entry, entry_tag, tag};
use anyhow::Result;
use camino::Utf8Path;
use glob::glob;
use pulldown_cmark::{html, CodeBlockKind, CowStr, Event, Tag, TagEnd};
use sea_orm::{prelude::*, ActiveModelTrait, ActiveValue::Set, DatabaseConnection, EntityTrait};
use std::fs;

pub fn parse_content(contents: String) -> Result<(Option<Frontmatter>, Vec<u8>)> {
	let parts = contents.splitn(3, "+++");
	let (data, markdown) = match parts.collect::<Vec<&str>>().as_slice() {
		[_, frontmatter, markdown] => {
			let data = toml::from_str::<Frontmatter>(frontmatter).ok();

			(data, markdown.to_string())
		}
		_ => (None, contents),
	};
	let parser = pulldown_cmark::Parser::new(markdown.as_str());
	let mut events = Vec::new();
	let mut to_highlight = String::new();
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
					let mut highlighted_lines = Vec::new();
					let inner_html = to_highlight;

					for line in inner_html.trim().lines() {
						highlighted_lines.push(format!(
							"<span></span><span>{}</span>",
							html_escape::encode_text(line)
						));
					}

					let hightlighted_html = format!(
						r#"<figure class="code-block" data-language="{}"><pre><code>{}</code></pre></figure>"#,
						lang,
						highlighted_lines.join("\n")
					);
					events.push(Event::Html(CowStr::Boxed(
						hightlighted_html.into_boxed_str(),
					)));
					to_highlight = String::new();
					code_block_lang = None;
				}
			}
			Event::Text(t) => {
				if let Some(_lang) = code_block_lang.clone() {
					to_highlight.push_str(&t);
				} else {
					events.push(Event::Text(t))
				}
			}
			e => {
				events.push(e);
			}
		}
	}

	let mut html_output = String::new();

	html::push_html(&mut html_output, events.into_iter());

	Ok((data, html_output.as_bytes().to_vec()))
}

pub async fn import_content(connection: &DatabaseConnection) -> Result<()> {
	let paths = glob("content/tags/*.toml")?.flatten();

	for path in paths {
		if let Some(path) = Utf8Path::from_path(&path) {
			let mut tag = tag::ActiveModel {
				..Default::default()
			};
			let slug = path.file_stem().expect("file stem should exist");
			let contents = fs::read_to_string(path)?;
			let data = toml::from_str::<Frontmatter>(contents.as_str()).ok();

			if let Some(data) = data {
				tag.title = Set(data.title);
			}

			tag.slug = Set(slug.to_string());

			tag.insert(connection).await?;
		}
	}

	let paths = glob("content/posts/*.md")?.flatten();

	for path in paths {
		if let Some(path) = Utf8Path::from_path(&path) {
			let mut entry = entry::ActiveModel {
				..Default::default()
			};
			let slug = path.file_stem().expect("file stem should exist");
			let contents = fs::read_to_string(path)?;
			let (data, content) = parse_content(contents)?;

			if let Some(data) = data.clone() {
				entry.title = Set(data.title);
				entry.date = Set(data.date);
			}

			entry.content = Set(String::from_utf8(content)?);
			entry.slug = Set(slug.to_string());

			let entry = entry.insert(connection).await?;

			if let Some(data) = data {
				if let Some(tags) = data.tags {
					for slug in tags {
						let tag_result = tag::Entity::find()
							.filter(tag::Column::Slug.eq(slug.clone()))
							.one(connection)
							.await?;
						let tag = if let Some(tag) = tag_result {
							tag
						} else {
							let mut tag = tag::ActiveModel {
								..Default::default()
							};

							tag.slug = Set(slug);
							tag.insert(connection).await?
						};
						let mut entry_tag = entry_tag::ActiveModel {
							..Default::default()
						};

						entry_tag.entry_id = Set(entry.id);
						entry_tag.tag_id = Set(tag.id);
						entry_tag.insert(connection).await?;
					}
				}
			}
		}
	}

	Ok(())
}
