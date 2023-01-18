use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Site {
    pub title: String,
    pub base: String,
    pub description: String,
    pub copyright: String,
}

impl Site {
    pub fn get() -> Self {
        match fs::read_to_string("content/site.json") {
            Ok(file_contents) => serde_json::from_str::<Self>(&file_contents)
                .expect("failed to parse content/site.json"),
            _ => Self::default(),
        }
    }
}
