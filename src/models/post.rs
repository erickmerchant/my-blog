use serde::{Deserialize, Serialize};
use std::{fs, path::Path, vec::Vec};

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
pub struct Post {
    #[serde(default)]
    pub slug: String,
    pub title: String,
    #[serde(default = "Post::default_date")]
    pub date: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub content: String,
    #[serde(default = "Post::default_template")]
    pub template: String,
}

impl Post {
    fn default_date() -> String {
        "0000-00-00".to_string()
    }

    fn default_template() -> String {
        "post.html".to_string()
    }

    fn default_directory() -> String {
        "content/posts".to_string()
    }

    pub fn get_by_slug(slug: String) -> Option<Self> {
        Self::get_by_slug_and_directory(slug, Self::default_directory())
    }

    pub fn get_by_slug_and_directory(slug: String, directory: String) -> Option<Self> {
        let path = Path::new(&directory).join(&slug).with_extension("html");
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

        if let Ok(entries) = fs::read_dir(Self::default_directory()) {
            for entry in entries.flatten() {
                let path = entry.path();

                if let Some(ext) = path.extension() {
                    if ext == "html" {
                        if let Some(slug) = path.file_stem().and_then(|slug| slug.to_str()) {
                            if let Some(post) = Self::get_by_slug(slug.to_string()) {
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
