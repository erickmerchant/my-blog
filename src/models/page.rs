use serde::{Deserialize, Serialize};
use std::{fs, path::Path};

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
pub struct Page {
    #[serde(default)]
    pub slug: String,
    pub title: String,
    #[serde(default)]
    pub content: String,
    #[serde(default = "Page::default_template")]
    pub template: String,
}

impl Page {
    fn default_template() -> String {
        String::from("page.html")
    }

    pub fn get_by_slug(slug: String) -> Option<Self> {
        let path = Path::new("content/pages")
            .join(&slug)
            .with_extension("html");
        let mut result = None;

        if let Ok(contents) = fs::read_to_string(path) {
            let mut data = Self::default();
            let mut content = contents.to_owned();

            if let Some((above, below)) = contents.split_once("---") {
                if let Ok(frontmatter) = serde_json::from_str::<Self>(above) {
                    data = frontmatter;

                    content = below.to_string();
                }
            }

            result = Some(Self {
                slug,
                content,
                ..data
            });
        }

        result
    }
}
