use serde::{Deserialize, Serialize};
use std::{fs, vec::Vec};

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
pub struct Model {
    pub title: String,
    pub base: String,
    pub description: String,
    pub copyright: String,
    #[serde(default)]
    pub components: Vec<String>,
}

impl Model {
    pub fn get() -> Self {
        match fs::read_to_string("content/Site.json") {
            Ok(file_contents) => serde_json::from_str::<Self>(&file_contents)
                .expect("failed to parse content/Site.json"),
            _ => Self::default(),
        }
    }
}
