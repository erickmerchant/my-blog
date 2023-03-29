use serde::{Deserialize, Serialize};
use std::fs::read_to_string;

#[derive(Clone, Deserialize, Serialize)]
pub struct Site {
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub base: String,
    #[serde(default)]
    pub year: u32,
    #[serde(default)]
    pub author: String,
}

impl Default for Site {
    fn default() -> Self {
        Self {
            title: "".to_string(),
            base: "".to_string(),
            year: 0,
            author: "".to_string(),
        }
    }
}

impl Site {
    pub fn get_site() -> Self {
        let site_json_str = read_to_string("./content/site.json").unwrap_or_default();

        let site: Site = serde_json::from_slice(site_json_str.as_bytes()).unwrap_or_default();

        site
    }
}
