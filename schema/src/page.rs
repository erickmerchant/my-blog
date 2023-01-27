use serde::{Deserialize, Serialize};
use std::{convert::AsRef, vec::Vec};

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
pub struct Page {
    #[serde(default)]
    pub path: String,
    pub title: String,
    #[serde(default = "Page::default_date")]
    pub date: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub content: String,
    #[serde(default = "Page::default_template")]
    pub template: String,
}

impl Page {
    fn default_date() -> String {
        "0000-00-00".to_string()
    }

    fn default_template() -> String {
        "post.jinja".to_string()
    }

    pub fn get_one<S: AsRef<str>>(_path: S) -> Option<Self> {
        Some(Page::default())
    }

    pub fn get_all<S: AsRef<str>>(_pattern: S) -> Vec<Self> {
        vec![Self::default()]
    }
}
