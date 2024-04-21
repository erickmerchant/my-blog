use axum::{
	extract::State,
	http::header,
	http::StatusCode,
	response::{Html, IntoResponse, Response},
};
use camino::Utf8Path;
use std::{fs, io::Write, sync::Arc};

pub async fn not_found_handler(
	State(templates): State<Arc<crate::templates::Engine>>,
) -> Result<Response, crate::Error> {
	let cache_path = Utf8Path::new("storage").join("404.html");
	let cache_result = fs::read_to_string(&cache_path);

	if let Ok(body) = cache_result {
		return Ok((
			StatusCode::NOT_FOUND,
			[(header::CONTENT_TYPE, "text/html; charset=utf-8".to_string())],
			body,
		)
			.into_response());
	}

	let body = templates.render("not-found.jinja".to_string(), None)?;
	let mut file = fs::File::create(&cache_path)?;

	file.write_all(&body.as_bytes())?;

	Ok((StatusCode::NOT_FOUND, Html(body)).into_response())
}
