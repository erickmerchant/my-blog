use glob::glob;
use serde::{Deserialize, Serialize};
use std::{convert::AsRef, fs, path::Path, vec::Vec};

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
pub struct Entry {
    #[serde(default)]
    pub slug: String,
    pub title: String,
    #[serde(default = "Entry::default_date")]
    pub date: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub content: String,
    #[serde(default = "Entry::default_template")]
    pub template: String,
}

impl Entry {
    fn default_date() -> String {
        "0000-00-00".to_string()
    }

    fn default_template() -> String {
        "post.html.jinja".to_string()
    }

    pub fn get_one<S: AsRef<str>>(path: S) -> Option<Self> {
        let mut result = None;
        let path = Path::new(path.as_ref());

        if let (Some(slug), Ok(contents)) = (path.file_stem()?.to_str(), fs::read_to_string(path)) {
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
                slug: slug.to_string(),
                content,
                ..data
            });
        }

        result
    }

    pub fn get_all<S: AsRef<str>>(pattern: S) -> Vec<Self> {
        let mut entries = Vec::<Self>::new();

        if let Ok(results) = glob(pattern.as_ref()) {
            for entry in results.flatten() {
                if let Some(entry) = Self::get_one(entry.display().to_string()) {
                    entries.push(entry);
                }
            }
        }

        entries.sort_by(|a, b| b.date.cmp(&a.date));

        entries
    }
}
