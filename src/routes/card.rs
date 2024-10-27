use super::not_found;
use crate::models::{post, site};
use axum::{
	extract::{Path, State},
	http::{header, StatusCode},
	response::{IntoResponse, Response},
};
use resvg::{tiny_skia, usvg, usvg::fontdb};
use rinja::Template;
use std::sync::Arc;

#[derive(Template)]
#[template(path = "card.xml")]
struct View {
	pub site: site::Model,
	pub post: post::Model,
}

pub async fn handler(
	State(state): State<Arc<crate::State>>,
	Path(slug): Path<String>,
) -> Result<Response, crate::Error> {
	let post: Option<post::Model> = post::Model::by_slug(&state.base_dir, &slug).await;

	if let Some(post) = post {
		let site = site::Model::read(&state.base_dir).await?;
		let html = View { site, post }.render()?;
		let mut fonts = fontdb::Database::new();

		fonts.load_fonts_dir("public");

		let svg_tree = usvg::Tree::from_str(
			html.as_str(),
			&usvg::Options {
				fontdb: Arc::new(fonts),
				..Default::default()
			},
		)?;

		if let Some(mut pixmap) = tiny_skia::Pixmap::new(1147, 645) {
			let mut pixmap_mut = pixmap.as_mut();

			resvg::render(
				&svg_tree,
				resvg::tiny_skia::Transform::identity(),
				&mut pixmap_mut,
			);

			let data = pixmap.encode_png()?;

			return Ok((
				StatusCode::OK,
				[(header::CONTENT_TYPE, mime::IMAGE_PNG.to_string())],
				data,
			)
				.into_response());
		}
	}

	not_found::handler(State(state)).await
}
