use chrono::{NaiveDate, Utc};
use minijinja::{path_loader, Environment};

static FORMAT: &str = "%Y-%m-%d";

pub fn get_env() -> Environment<'static> {
	let mut template_env = Environment::new();

	template_env.set_loader(path_loader("theme"));
	template_env.add_filter("format_date", format_date);
	template_env.add_function("current_date", current_date);

	template_env
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
