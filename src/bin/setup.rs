use anyhow::Result;
use app::{
	models::{cache, entry, entry_tag, tag},
	templates::get_env,
};
use camino::Utf8Path;
use glob::glob;
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use minijinja::context;
use pathdiff::diff_utf8_paths;
use sea_orm::{
	prelude::*, sea_query::Index, ActiveModelTrait, ActiveValue::Set, ConnectionTrait, Database,
	EntityTrait, Schema,
};
use serde_json as json;
use std::{cell::RefCell, collections::HashSet, fs, rc::Rc};
use syntect::{
	html::{ClassStyle, ClassedHTMLGenerator},
	parsing::SyntaxSet,
	util::LinesWithEndings,
};
use tokio::try_join;

fn rewrite_and_scrape(
	contents: String,
) -> Result<(
	Option<entry::frontmatter::Frontmatter>,
	Vec<u8>,
	entry::Elements,
)> {
	let data: Rc<RefCell<Option<entry::frontmatter::Frontmatter>>> = Rc::new(RefCell::new(None));
	let mut elements = HashSet::<String>::new();
	let template_env = get_env();
	let ss = SyntaxSet::load_defaults_newlines();
	let mut output = Vec::new();
	let language_buffer = Rc::new(RefCell::new(String::new()));
	let mut rewriter = HtmlRewriter::new(
		Settings {
			element_content_handlers: vec![
				element!("front-matter", |el| {
					el.remove();

					Ok(())
				}),
				text!("front-matter", |el| {
					if let Ok(d) = json::from_str::<entry::frontmatter::Frontmatter>(el.as_str()) {
						data.borrow_mut().replace(d);
					}

					Ok(())
				}),
				element!("code-block[language]", |el| {
					if let Some(language) = el.get_attribute("language") {
						language_buffer.borrow_mut().push_str(&language);
					}

					el.remove_and_keep_content();

					Ok(())
				}),
				text!("code-block[language]", |el| {
					let mut language = language_buffer.borrow_mut();

					if let Some(syntax) = ss.find_syntax_by_extension(&language) {
						let inner_html = String::from(el.as_str());
						let mut highlighted_lines = Vec::<String>::new();

						for line in LinesWithEndings::from(inner_html.trim()) {
							let mut html_generator = ClassedHTMLGenerator::new_with_class_style(
								syntax,
								&ss,
								ClassStyle::Spaced,
							);
							html_generator.parse_html_for_line_which_includes_newline(line)?;
							highlighted_lines.push(html_generator.finalize());
						}

						let ctx = context! {
							language => language.clone(),
							highlighted_lines => highlighted_lines,
							inner_html => inner_html
						};
						let template = template_env.get_template("elements/code-block.jinja")?;
						let replacement_html = template.render(ctx)?;

						el.replace(replacement_html.as_str(), ContentType::Html);
						elements.insert("code-block".to_string());
					}

					language.clear();

					Ok(())
				}),
			],
			..Default::default()
		},
		|c: &[u8]| output.extend_from_slice(c),
	);

	rewriter.write(contents.as_bytes())?;
	rewriter.end()?;

	let elements = entry::Elements(elements.into_iter().collect::<Vec<String>>());

	let data = data.take();

	Ok((data, output, elements))
}

#[tokio::main]
async fn main() -> Result<()> {
	fs::remove_dir_all("storage").ok();
	fs::create_dir_all("storage")?;

	let connection = Database::connect("sqlite://./storage/content.db?mode=rwc")
		.await
		.expect("database should connect");
	let backend = connection.get_database_backend();
	let schema = Schema::new(backend);

	try_join!(
		connection.execute(
			backend
				.build(&schema.create_table_from_entity(entry::Entity))
				.to_owned(),
		),
		connection.execute(
			backend
				.build(&schema.create_table_from_entity(tag::Entity))
				.to_owned(),
		),
		connection.execute(
			backend
				.build(&schema.create_table_from_entity(entry_tag::Entity))
				.to_owned(),
		),
		connection.execute(
			backend
				.build(
					Index::create()
						.name("entry-slug-category-unique")
						.table(entry::Entity)
						.col(entry::Column::Slug)
						.col(entry::Column::Category)
						.unique()
				)
				.to_owned(),
		),
		connection.execute(
			backend
				.build(&schema.create_table_from_entity(cache::Entity))
				.to_owned(),
		),
	)?;

	let paths = glob("content/*/*.html".to_string().as_str())?;

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
			let (data, content, elements) = rewrite_and_scrape(contents)?;

			if let Some(data) = data.clone() {
				entry.title = Set(data.title);
				entry.description = Set(data.description);
				entry.permalink = Set(data.permalink);
				entry.template = Set(data.template);
				entry.date = Set(data.date);
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
