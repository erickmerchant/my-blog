use crate::FileSystem;

#[derive(Clone)]
pub struct State {
	pub public: FileSystem,
	pub content: FileSystem,
	pub storage: FileSystem,
}
