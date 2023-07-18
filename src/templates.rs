use camino::Utf8Path;
use chrono::{Datelike, NaiveDate, Utc};
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

fn asset_url(mut url: String) -> String {
	if url.starts_with('/') && !envmnt::is("APP_DEV") {
		if let Ok(time) = fs::metadata(format!("theme{url}")).and_then(|meta| meta.modified()) {
			let version_time = time
				.duration_since(UNIX_EPOCH)
				.map(|d| d.as_secs())
				.expect("time should be a valid time since the unix epoch");
			let cache_key = base62::encode(version_time);
			let path = Utf8Path::new(&url);
			let ext = path.extension().unwrap_or_default();
			url = path
				.with_extension(format!("{cache_key}.{ext}"))
				.to_string();
		}
	};

	url
}
