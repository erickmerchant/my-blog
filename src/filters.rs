use askama::{Result, Values};
use pulldown_cmark::{html, Options, Parser};

pub fn md_to_html<T: std::fmt::Display>(contents: T, _: &dyn Values) -> Result<String> {
	let contents = contents.to_string();
	let mut options = Options::empty();

	options.insert(Options::ENABLE_STRIKETHROUGH);

	let parser = Parser::new_ext(contents.as_str(), options);
	let mut markdown = String::new();

	html::push_html(&mut markdown, parser);

	Ok(markdown)
}
