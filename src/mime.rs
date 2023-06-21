pub fn get_mime(extension: Option<&str>) -> Option<String> {
	match extension {
		Some("css") => Some("text/css; charset=utf-8".to_string()),
		Some("js") => Some("text/javascript; charset=utf-8".to_string()),
		Some("svg") => Some("image/svg+xml; charset=utf-8".to_string()),
		Some("txt") => Some("text/plain; charset=utf-8".to_string()),
		Some("jpeg") => Some("image/jpeg".to_string()),
		Some("woff") => Some("font/woff".to_string()),
		_ => None,
	}
}
