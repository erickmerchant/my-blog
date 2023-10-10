use chrono::{NaiveDate, Utc};
use minijinja::{context, path_loader, Environment, Value};
use std::fs;

static FORMAT: &str = "%Y-%m-%d";

#[derive(Debug, Clone)]
pub struct Engine {
	pub env: Environment<'static>,
}

impl Engine {
	pub fn new() -> Self {
		let mut env = Environment::new();

		env.set_loader(path_loader("theme"));
		env.add_filter("format_date", format_date);
		env.add_function("current_date", current_date);

		Self { env }
	}

	pub fn render(&self, template: String, ctx: Value) -> Result<String, anyhow::Error> {
		let json = fs::read_to_string("content/site.json")?;
		let site: serde_json::Value = serde_json::from_str(&json)?;

		Ok(self
			.env
			.get_template(template.as_str())
			.and_then(|template| template.render(context! { site, ..ctx }))?)
	}
}

fn format_date(value: String, fmt: String) -> String {
	if let Ok(parsed) = NaiveDate::parse_from_str(&value, FORMAT) {
		parsed.format(&fmt).to_string()
	} else {
		value
	}
}

fn current_date() -> String {
	let current_date = Utc::now();

	current_date.format(FORMAT).to_string()
}
