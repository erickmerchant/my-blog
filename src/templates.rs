use chrono::{Datelike, NaiveDate, Utc};
use minijinja::{path_loader, Environment};

pub fn get_env() -> Environment<'static> {
	let mut template_env = Environment::new();

	template_env.set_loader(path_loader("theme"));
	template_env.add_filter("format_date", format_date);
	template_env.add_function("year", year);

	template_env
}

fn format_date(value: String, fmt: String) -> String {
	if let Ok(parsed) = NaiveDate::parse_from_str(&value, "%Y-%m-%d") {
		parsed.format(&fmt).to_string()
	} else {
		value
	}
}

fn year() -> i32 {
	let current_date = Utc::now();

	current_date.year()
}
