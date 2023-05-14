use chrono::Datelike;
use minijinja::{Environment, Source};

pub fn get_env() -> Environment<'static> {
	let mut template_env = Environment::new();

	template_env.set_source(Source::from_path("theme"));
	template_env.add_filter("format_date", format_date);
	template_env.add_function("year", year);

	template_env
}

fn format_date(value: String, fmt: String) -> String {
	let mut ret = value.clone();

	if let Ok(parsed) = chrono::NaiveDate::parse_from_str(&value, "%Y-%m-%d") {
		ret = parsed.format(&fmt).to_string();
	}

	ret
}

fn year() -> i32 {
	let current_date = chrono::Utc::now();

	current_date.year()
}
