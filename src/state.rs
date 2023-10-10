#[derive(Debug, Clone)]
pub struct State {
	pub templates: crate::templates::Engine,
	pub database: sea_orm::DatabaseConnection,
}
