#[derive(Debug, Clone)]
pub struct State {
	pub templates: minijinja::Environment<'static>,
	pub database: sea_orm::DatabaseConnection,
}
