use pulldown_cmark::{html, CodeBlockKind, CowStr, Event, Options, Parser, Tag, TagEnd};

pub fn html<T: std::fmt::Display>(contents: T) -> rinja::Result<String> {
	let contents = format!("{contents}");
	let mut options = Options::empty();

	options.insert(Options::ENABLE_STRIKETHROUGH);

	let parser = Parser::new_ext(contents.as_str(), options);
	let mut events = Vec::new();
	let mut code_block_text = None;
	let mut lang = String::default();

	for event in parser {
		match event {
			Event::Start(Tag::CodeBlock(l)) => {
				(code_block_text, lang) = match l {
					CodeBlockKind::Fenced(lang) => (Some(String::new()), lang.to_string()),
					_ => (None, String::default()),
				};
			}
			Event::End(TagEnd::CodeBlock) => {
				if let Some(text) = &code_block_text {
					let mut lines = Vec::new();
					let inner_html = text;

					for line in inner_html.trim().lines() {
						lines.push(format!("<code>{}</code>", html_escape::encode_text(line)));
					}

					let highlighted_html = format!(
						r#"<code-block data-language="{}"><pre>{}</pre></code-block>"#,
						lang,
						lines.join("\n")
					);

					events.push(Event::Html(CowStr::Boxed(
						highlighted_html.into_boxed_str(),
					)));
					code_block_text = None;
				}
				lang = String::default();
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
