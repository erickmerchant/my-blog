use super::args::Args;

#[derive(Debug, Clone)]
pub struct AppState {
	pub templates: minijinja::Environment<'static>,
	pub database: sea_orm::DatabaseConnection,
	pub args: Args,
}
