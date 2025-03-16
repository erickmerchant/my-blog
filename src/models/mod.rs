pub mod post;
pub mod resume;
pub mod site;

pub use post::Post;
pub use resume::Resume;
pub use site::Site;

#[derive(Clone)]
pub struct Model {
	pub base_dir: String,
}

impl Model {
	pub fn new(base_dir: String) -> Self {
		Self { base_dir }
	}
}
