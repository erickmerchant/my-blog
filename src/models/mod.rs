pub mod post;
pub mod resume;
pub mod site;

#[derive(Clone)]
pub struct Model {
	pub base_dir: String,
}

impl Model {
	pub fn new(base_dir: String) -> Self {
		Self { base_dir }
	}
}
