use super::frontmatter::Frontmatter;
use crate::{
	entry::models::{entry, entry_tag, tag},
	templates::get_env,
};
use anyhow::Result;
use camino::Utf8Path;
use glob::glob;
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use minijinja::context;
use pathdiff::diff_utf8_paths;
use sea_orm::{prelude::*, ActiveModelTrait, ActiveValue::Set, DatabaseConnection, EntityTrait};
use serde_json as json;
use std::{cell::RefCell, collections::HashSet, fs, rc::Rc};
use syntect::{
	html::{ClassStyle, ClassedHTMLGenerator},
	parsing::SyntaxSet,
	util::LinesWithEndings,
};

pub fn parse_content(contents: String) -> Result<(Option<Frontmatter>, Vec<u8>, entry::Elements)> {
	let data: Rc<RefCell<Option<Frontmatter>>> = Rc::new(RefCell::new(None));
	let mut elements = HashSet::<String>::new();
	let template_env = get_env();
	let ss = SyntaxSet::load_defaults_newlines();
	let mut content = Vec::new();
	let language_buffer = Rc::new(RefCell::new(String::new()));
	let default_line: u32 = 1;
	let first_line_buffer = Rc::new(RefCell::new(default_line));
	let mut rewriter = HtmlRewriter::new(
		Settings {
			element_content_handlers: vec![
				element!("front-matter", |el| {
					el.remove();

					Ok(())
				}),
				text!("front-matter", |el| {
					if let Ok(d) = json::from_str::<Frontmatter>(el.as_str()) {
						data.borrow_mut().replace(d);
					}

					Ok(())
				}),
				element!("*", |el| {
					if el.tag_name().contains('-') && el.tag_name() != "front-matter" {
						elements.insert(el.tag_name().to_string());
					}

					Ok(())
				}),
				element!("code-block[language]", |el| {
					if let Some(language) = el.get_attribute("language") {
						language_buffer.borrow_mut().push_str(&language);
					}

					if let Some(first_line) = el.get_attribute("first-line") {
						first_line_buffer.replace(first_line.parse::<u32>().unwrap_or(1));
					}

					el.remove_and_keep_content();

					Ok(())
				}),
				text!("code-block[language]", |el| {
					let mut language = language_buffer.borrow_mut();
					let first_line = first_line_buffer.as_ref();

					if !language.is_empty() {
						let mut highlighted_lines = Vec::<String>::new();
						let inner_html = String::from(el.as_str());

						if let Some(syntax) = ss.find_syntax_by_extension(&language) {
							for line in LinesWithEndings::from(inner_html.trim()) {
								let mut html_generator = ClassedHTMLGenerator::new_with_class_style(
									syntax,
									&ss,
									ClassStyle::Spaced,
								);

								html_generator.parse_html_for_line_which_includes_newline(line)?;
								highlighted_lines.push(html_generator.finalize());
							}
						} else {
							for line in inner_html.trim().lines() {
								highlighted_lines.push(format!("<span>{}</span>", line));
							}
						}

						let ctx = context! {
							language => language.clone(),
							first_line => first_line.clone(),
							highlighted_lines => highlighted_lines,
							inner_html => inner_html
						};
						let template = template_env.get_template("elements/code-block.jinja")?;
						let replacement_html = template.render(ctx)?;

						el.replace(replacement_html.as_str(), ContentType::Html);
						language.clear();
						first_line_buffer.replace(default_line);
					}

					Ok(())
				}),
			],
			..Default::default()
		},
		|c: &[u8]| content.extend_from_slice(c),
	);

	rewriter.write(contents.as_bytes())?;
	rewriter.end()?;

	let elements = entry::Elements(elements.into_iter().collect::<Vec<String>>());
	let data = data.take();

	Ok((data, content, elements))
}

pub async fn import_content(connection: &DatabaseConnection) -> Result<()> {
	let paths = glob("content/*/*.html".to_string().as_str())?;
	let connection = connection.clone();

	for path in paths.flatten() {
		if let Some(path) = Utf8Path::from_path(&path) {
			let diff = diff_utf8_paths(path, Utf8Path::new("content/"))
				.expect("path should be diffable with content");
			let mut entry = entry::ActiveModel {
				..Default::default()
			};
			let slug = diff.file_stem().expect("file stem should exist");
			let category = diff.parent().expect("parent should exist");
			let contents = fs::read_to_string(path)?;
			let (data, content, elements) = parse_content(contents)?;

			if let Some(data) = data.clone() {
				entry.title = Set(data.title);
				entry.description = Set(data.description);
				entry.permalink = Set(data.permalink);
				entry.template = Set(data.template);
				entry.date = Set(data.date);
				entry.feed = Set(data.feed);
			}

			entry.content = Set(String::from_utf8(content)?);
			entry.elements = Set(elements);
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
