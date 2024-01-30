use chrono::NaiveDate;
use minijinja::{context, path_loader, Environment, Value};
use std::fs;

const FORMAT: &str = "%Y-%m-%d";

#[derive(Debug, Clone)]
pub struct Engine {
	pub env: Environment<'static>,
}

impl Engine {
	pub fn new() -> Self {
		let mut env = Environment::new();

		env.set_loader(path_loader("templates"));
		env.add_filter("format_date", format_date);

		Self { env }
	}

	pub fn render(&self, template: String, ctx: Option<Value>) -> Result<String, anyhow::Error> {
		let toml = fs::read_to_string("content/site.toml")?;
		let site = toml::from_str::<toml::Value>(&toml)?;
		let ctx = ctx.unwrap_or(context! {});

		Ok(self
			.env
			.get_template(template.as_str())
			.and_then(|template| template.render(Some(context! { site, ..ctx })))?)
	}
}

fn format_date(value: String, fmt: String) -> String {
	if let Ok(parsed) = NaiveDate::parse_from_str(&value, FORMAT) {
		parsed.format(&fmt).to_string()
	} else {
		value
	}
}
