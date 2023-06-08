use chrono::Datelike;
use minijinja::{Environment, Source};
use std::{fs, time::UNIX_EPOCH};

pub fn get_env() -> Environment<'static> {
	let mut template_env = Environment::new();

	template_env.set_source(Source::from_path("theme"));
	template_env.add_filter("format_date", format_date);
	template_env.add_function("year", year);
	template_env.add_function("asset_url", asset_url);

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

fn asset_url(value: String) -> String {
	let mut ret = value;

	if ret.starts_with('/') && !envmnt::is("APP_DEV") {
		if let Ok(meta) = fs::metadata(format!("theme{}", ret)) {
			if let Ok(time) = meta.modified() {
				ret.push_str(&format!(
					"?v={}",
					time.duration_since(UNIX_EPOCH)
						.expect("valid time since the epoch")
						.as_secs()
				));
			}
		}
	};

	ret
}
