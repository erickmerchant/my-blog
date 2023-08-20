use super::frontmatter::Frontmatter;
use crate::{models::entry, templates::get_env};
use anyhow::Result;
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use minijinja::context;
use serde_json as json;
use std::{cell::RefCell, collections::HashSet, rc::Rc};
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

					el.remove_and_keep_content();

					Ok(())
				}),
				text!("code-block[language]", |el| {
					let mut language = language_buffer.borrow_mut();
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
						highlighted_lines => highlighted_lines,
						inner_html => inner_html
					};
					let template = template_env.get_template("elements/code-block.jinja")?;
					let replacement_html = template.render(ctx)?;

					el.replace(replacement_html.as_str(), ContentType::Html);

					language.clear();

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
