use askama::{Result, Values};
use pulldown_cmark::{html, CodeBlockKind, CowStr, Event, Options, Parser, Tag, TagEnd};

pub fn md_to_html<T: std::fmt::Display>(contents: T, _: &dyn Values) -> Result<String> {
	let contents = contents.to_string();
	let mut options = Options::empty();

	options.insert(Options::ENABLE_STRIKETHROUGH);

	let parser = Parser::new_ext(contents.as_str(), options);
	let mut events = Vec::new();
	let mut code_block_text = None;

	for event in parser {
		match event {
			Event::Start(Tag::CodeBlock(l)) => {
				code_block_text = match l {
					CodeBlockKind::Fenced(_) => Some(String::new()),
					_ => None,
				};
			}
			Event::End(TagEnd::CodeBlock) => {
				if let Some(text) = &code_block_text {
					let mut lines = Vec::new();
					let inner_html = text;

					for line in inner_html.trim().lines() {
						let trimmed_line = line.trim_ascii_start();
						let leading_tab_count = line.len() - trimmed_line.len();

						lines.push(format!(
							r#"<code data-indent="{}">{}</code>"#,
							leading_tab_count,
							html_escape::encode_text(line)
						));
					}

					let highlighted_html = format!(r#"<pre>{}</pre>"#, lines.join("\n"));

					events.push(Event::Html(CowStr::Boxed(
						highlighted_html.into_boxed_str(),
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

	Ok(markdown)
}
