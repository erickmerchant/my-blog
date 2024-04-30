use chrono::NaiveDate;

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
