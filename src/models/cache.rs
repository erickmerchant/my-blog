use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Model {
	pub content_type: String,
	pub etag: Option<String>,
	pub body: Vec<u8>,
}
