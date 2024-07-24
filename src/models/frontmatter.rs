use super::state;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Model {
	pub title: String,
	#[serde(default)]
	pub state: state::State,
}
