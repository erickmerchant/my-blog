use serde::{Deserialize, Serialize};
use std::{fs, path::Path, vec::Vec};

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
pub struct Post {
    #[serde(default)]
    pub slug: String,
    pub title: String,
    pub date: String,
    pub description: String,
    #[serde(default)]
    pub content: String,
}

impl Post {
    pub fn get_by_slug(slug: String) -> Option<Self> {
        let path = Path::new("content/posts")
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

    pub fn get_all() -> Vec<Self> {
        let mut posts = Vec::<Self>::new();

        if let Ok(entries) = fs::read_dir("content/posts") {
            for entry in entries.flatten() {
                let path = entry.path();

                if let Some(ext) = path.extension() {
                    if ext == "html" {
                        if let Some(slug) = path.file_stem().and_then(|slug| slug.to_str()) {
                            if let Some(post) = Self::get_by_slug(String::from(slug)) {
                                posts.push(post);
                            }
                        }
                    }
                }
            }
        }

        posts.sort_by(|a, b| b.date.cmp(&a.date));

        posts
    }
}
