use anyhow::Result;
use app::{
	models::{cache, entry},
	templates::get_env,
};
use camino::Utf8Path;
use glob::glob;
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use minijinja::context;
use pathdiff::diff_utf8_paths;
use sea_orm::{
	sea_query::Index, ActiveModelTrait, ActiveValue::Set, ConnectionTrait, Database, Schema,
};
use serde_json as json;
use std::{cell::RefCell, collections::HashSet, fs, rc::Rc};
use syntect::{
	html::{ClassStyle, ClassedHTMLGenerator},
	parsing::SyntaxSet,
	util::LinesWithEndings,
};
use tokio::try_join;

fn rewrite_and_scrape(contents: String) -> Result<(json::Value, Vec<u8>, entry::Elements)> {
	let mut data = json::Value::Null;
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
					if let Ok(d) = json::from_str(el.as_str()) {
						data = d;
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
			let mut post = entry::ActiveModel {
				..Default::default()
			};
			let slug = diff.file_stem().expect("file stem should exist");
			let category = diff.parent().expect("parent should exist");
			let contents = fs::read_to_string(path)?;
			let (data, content, elements) = rewrite_and_scrape(contents)?;

			post.set_from_json(data).ok();
			post.content = Set(String::from_utf8(content)?);
			post.elements = Set(elements);
			post.slug = Set(slug.to_string());
			post.category = Set(category.to_string());
			post.insert(&connection).await?;
		}
	}

	Ok(())
}
