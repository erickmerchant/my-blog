use serde::{Deserialize, Serialize};

#[derive(Clone, Deserialize, Debug, Serialize)]
pub struct Page {
    #[serde(default)]
    pub slug: String,
    #[serde(default)]
    pub category: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub date: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub content: String,
    #[serde(default)]
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
