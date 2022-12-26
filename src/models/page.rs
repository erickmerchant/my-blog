use glob::glob;
use pathdiff::diff_paths;
use serde::{Deserialize, Serialize};
use std::{convert::AsRef, fs, path::Path, vec::Vec};

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

    pub fn get_one<S: AsRef<str>>(path: S) -> Option<Self> {
        let mut result = None;
        let content = Path::new("content");
        let pattern = content.join(path.as_ref());
        let pattern = pattern.as_path();

        if let Ok(contents) = fs::read_to_string(pattern) {
            let mut data = Self::default();
            let mut content = contents.to_owned();

            if contents.starts_with("{\n") {
                if let Some((above, below)) = contents.split_once("}\n") {
                    if let Ok(frontmatter) =
                        serde_json::from_str::<Self>(format!("{above}}}").as_str())
                    {
                        data = frontmatter;

                        content = below.to_string();
                    }
                }
            }

            result = Some(Self {
                path: path.as_ref().to_string(),
                content,
                ..data
            });
        }

        result
    }

    pub fn get_all<S: AsRef<str>>(pattern: S) -> Vec<Self> {
        let mut entries = Vec::<Self>::new();
        let content = Path::new("content");
        let pattern = content.join(pattern.as_ref());
        let pattern = pattern.as_path();

        if let Some(pages) = pattern.to_str().and_then(|s| glob(s).ok()) {
            for page in pages.flatten() {
                if let Some(path) = diff_paths(page, "content") {
                    if let Some(page) = path.as_path().to_str().and_then(Self::get_one) {
                        entries.push(page);
                    }
                }
            }
        }

        entries.sort_by(|a, b| b.date.cmp(&a.date));

        entries
    }
}
