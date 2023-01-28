use serde::{Deserialize, Serialize};
use std::{convert::AsRef, vec::Vec};

#[derive(Clone, Deserialize, Debug, Serialize)]
pub struct Page {
    pub slug: String,
    pub category: String,
    pub title: String,
    pub date: String,
    pub description: String,
    pub content: String,
    pub template: String,
}

impl Default for Page {
    fn default() -> Self {
        Self {
            slug: "".to_string(),
            category: "".to_string(),
            title: "Untitled".to_string(),
            date: "0000-00-00".to_string(),
            description: "".to_string(),
            content: "".to_string(),
            template: "post.jinja".to_string(),
        }
    }
}
