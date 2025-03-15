use crate::models::Model;

#[derive(Clone)]
pub struct State {
	pub base_dir: String,
	pub rewrite_assets: bool,
	pub model: Model,
}
