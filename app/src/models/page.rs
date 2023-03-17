use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Clone, Deserialize, Debug, Serialize)]
pub struct Page {
    #[serde(default)]
    pub slug: String,
    #[serde(default)]
    pub category: String,
    #[serde(default = "Page::get_default_title")]
    pub title: String,
    #[serde(default = "Page::get_default_date")]
    pub date: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub content: String,
    #[serde(default = "Page::get_default_template")]
    pub template: String,
    #[serde(default)]
    pub elements: HashSet<String>,
}

impl Default for Page {
    fn default() -> Self {
        Self {
            slug: "".to_string(),
            category: "".to_string(),
            title: Self::get_default_title(),
            date: Self::get_default_date(),
            description: "".to_string(),
            content: "".to_string(),
            template: Self::get_default_template(),
            elements: HashSet::<String>::new(),
        }
    }
}

impl Page {
    fn get_default_title() -> String {
        "Untitled".to_string()
    }

    fn get_default_date() -> String {
        "0000-00-00".to_string()
    }

    fn get_default_template() -> String {
        "layouts/post.jinja".to_string()
    }
}
