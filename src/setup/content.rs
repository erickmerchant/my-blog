use super::frontmatter::Frontmatter;
use crate::models::{entry, entry_tag, tag};
use anyhow::Result;
use camino::Utf8Path;
use glob::glob;
use pathdiff::diff_utf8_paths;
use pulldown_cmark::{html, CodeBlockKind, CowStr, Event, Tag};
use sea_orm::{prelude::*, ActiveModelTrait, ActiveValue::Set, DatabaseConnection, EntityTrait};
use serde_json as json;
use std::fs;
use syntect::{
	html::{ClassStyle, ClassedHTMLGenerator},
	parsing::SyntaxSet,
	util::LinesWithEndings,
};

pub fn parse_content(contents: String) -> Result<(Option<Frontmatter>, Vec<u8>)> {
	let parts = contents.splitn(3, "===");
	let ss = SyntaxSet::load_defaults_newlines();
	let (data, markdown) = match parts.collect::<Vec<&str>>().as_slice() {
		[_, frontmatter, markdown] => {
			let data = json::from_str::<Frontmatter>(frontmatter).ok();

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
			Event::End(Tag::CodeBlock(_)) => {
				if let Some(lang) = code_block_lang.clone() {
					let mut highlighted_lines = Vec::new();
					let inner_html = to_highlight.clone();

					if let Some(syntax) = ss.find_syntax_by_extension(&lang) {
						for line in LinesWithEndings::from(inner_html.trim()) {
							let mut html_generator = ClassedHTMLGenerator::new_with_class_style(
								syntax,
								&ss,
								ClassStyle::Spaced,
							);

							html_generator.parse_html_for_line_which_includes_newline(line)?;
							highlighted_lines.push(format!(
								"<span></span><span>{}</span>",
								html_generator.finalize()
							));
						}
					} else {
						for line in inner_html.trim().lines() {
							highlighted_lines.push(format!("<span></span><span>{line}</span>"));
						}
					}
					let hightlighted_html = format!(
						r#"<figure class="code-block"><pre><code>{}</code></pre></figure>"#,
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
					// If we're in a code block, build up the string of text
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
	let paths = glob("content/*/*.md")?
		.chain(glob("content/*/*.json")?)
		.flatten();
	let connection = connection.clone();

	for path in paths {
		if let Some(path) = Utf8Path::from_path(&path) {
			let diff = diff_utf8_paths(path, Utf8Path::new("content/"))
				.expect("path should be diffable with content");
			let mut entry = entry::ActiveModel {
				..Default::default()
			};
			let ext = diff.extension().expect("extension should exist");
			let slug = diff.file_stem().expect("file stem should exist");
			let category = diff.parent().expect("parent should exist");
			let contents = fs::read_to_string(path)?;
			let (data, content) = match ext {
				"md" => parse_content(contents)?,
				"json" => (
					json::from_str::<Frontmatter>(contents.as_str()).ok(),
					"".as_bytes().to_vec(),
				),
				_ => panic!("unknown file type"),
			};

			if let Some(data) = data.clone() {
				entry.title = Set(data.title);
				entry.permalink = Set(data.permalink);
				entry.template = Set(data.template);
				entry.date = Set(data.date);
				entry.feed_type = Set(data.feed_type);
			}

			entry.content = Set(String::from_utf8(content)?);
			entry.slug = Set(slug.to_string());
			entry.category = Set(category.to_string());

			let entry = entry.insert(&connection).await?;

			if let Some(data) = data {
				if let Some(tags) = data.tags {
					for slug in tags {
						let tag = if let Some(tag) = tag::Entity::find()
							.filter(tag::Column::Slug.eq(slug.clone()))
							.one(&connection)
							.await?
						{
							tag
						} else {
							let mut tag = tag::ActiveModel {
								..Default::default()
							};

							tag.slug = Set(slug);
							tag.insert(&connection).await?
						};
						let mut entry_tag = entry_tag::ActiveModel {
							..Default::default()
						};

						entry_tag.entry_id = Set(entry.id);
						entry_tag.tag_id = Set(tag.id);
						entry_tag.insert(&connection).await?;
					}
				}
			}
		}
	}

	Ok(())
}
