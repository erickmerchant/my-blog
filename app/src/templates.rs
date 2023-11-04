use crate::site::Site;
use camino::Utf8Path;
use chrono::{NaiveDate, Utc};
use lazy_static::lazy_static;
use minijinja::{context, path_loader, Environment, Value};

static FORMAT: &str = "%Y-%m-%d";

lazy_static! {
	static ref SITE: Site = {
		let json_string = include_str!("../../content/site.json").to_string();
		let site: Site = serde_json::from_str(&json_string).unwrap();
		site
	};
}

#[derive(Debug, Clone)]
pub struct Engine {
	pub env: Environment<'static>,
}

impl Engine {
	pub fn new() -> Self {
		let mut env = Environment::new();

		env.set_loader(path_loader("templates"));
		env.add_filter("format_date", format_date);
		env.add_function("current_date", current_date);

		Self { env }
	}

	pub fn render(&self, template: String, ctx: Value) -> Result<String, anyhow::Error> {
		Ok(self
			.env
			.get_template(
				Utf8Path::new(template.as_str())
					.with_extension("jinja")
					.as_str(),
			)
			.and_then(|template| {
				template.render(context! {
					site => SITE.clone(),
					..ctx
				})
			})?)
	}
}

fn format_date(value: String, fmt: String) -> String {
	if let Ok(parsed) = NaiveDate::parse_from_str(&value, FORMAT) {
		parsed.format(&fmt).to_string()
	} else {
		value
	}
}

impl Default for Engine {
	fn default() -> Self {
		Self::new()
	}
}

fn current_date() -> String {
	let current_date = Utc::now();

	current_date.format(FORMAT).to_string()
}
