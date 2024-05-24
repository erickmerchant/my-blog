use camino::Utf8Path;
use chrono::NaiveDate;
use std::{fs, time::UNIX_EPOCH};

const FORMAT: &str = "%Y-%m-%d";

pub fn format_date<T: std::fmt::Display>(value: T, fmt: &str) -> ::askama::Result<String> {
	Ok(
		if let Ok(parsed) = NaiveDate::parse_from_str(&value.to_string(), FORMAT) {
			parsed.format(fmt).to_string()
		} else {
			value.to_string()
		},
	)
}

pub fn asset_url<T: std::fmt::Display>(url: T) -> ::askama::Result<String> {
	let mut url = url.to_string();

	if url.starts_with('/') {
		if let Some(bare_url) = url.strip_prefix('/') {
			if let Ok(time) = fs::metadata(Utf8Path::new("public").join(bare_url))
				.and_then(|meta| meta.modified())
			{
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
		}
	};

	Ok(url)
}
