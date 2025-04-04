mod post;
mod resume;
mod site;

pub(super) use post::Post;
pub(super) use resume::Resume;
pub(super) use site::Site;

#[derive(Clone)]
pub struct Model {
	pub base_dir: String,
}

impl Model {
	pub fn new(base_dir: String) -> Self {
		Self { base_dir }
	}
}
