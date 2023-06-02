use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Link {
	title: String,
	href: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Site {
	title: String,
	description: String,
	base: String,
	author: String,
	links: Vec<Link>,
}

#[derive(Debug, Clone)]
pub struct AppState {
	pub templates: minijinja::Environment<'static>,
	pub database: sea_orm::DatabaseConnection,
	pub site: Site,
}
