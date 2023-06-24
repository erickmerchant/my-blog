use chrono::Datelike;
use minijinja::{path_loader, Environment};
use std::{fs, time::UNIX_EPOCH};

pub fn get_env() -> Environment<'static> {
	let mut template_env = Environment::new();

	template_env.set_loader(path_loader("theme"));
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
		if let Ok(time) = fs::metadata(format!("theme{}", ret)).and_then(|meta| meta.modified()) {
			let version_time = time
				.duration_since(UNIX_EPOCH)
				.expect("time should be a valid time since the unix epoch")
				.as_secs();

			let version_time = base62::encode(version_time);

			ret.push_str(&format!("?v={}", version_time));
		}
	};

	ret
}
