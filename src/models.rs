use serde::{Deserialize, Serialize};
use std::{fs, path::Path, vec::Vec};

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
pub struct Site {
    pub title: String,
    pub base: String,
    pub description: String,
    pub copyright: String,
    pub links: Vec<Link>,
    #[serde(default)]
    pub components: Vec<String>,
}

impl Site {
    pub fn get() -> Self {
        match fs::read_to_string("content/Site.json") {
            Ok(file_contents) => serde_json::from_str::<Self>(&file_contents)
                .expect("failed to parse content/Site.json"),
            _ => Self::default(),
        }
    }
}

#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct Link {
    pub href: String,
    pub title: String,
}

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
pub struct Post {
    #[serde(default)]
    pub slug: String,
    pub title: String,
    pub date: String,
    pub description: String,
    #[serde(default)]
    pub content: String,
    #[serde(default)]
    pub components: Vec<String>,
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
            let parts = contents.splitn(3, "===\n").collect::<Vec<&str>>();

            if parts.len() == 3 {
                if let Ok(parsed) = serde_json::from_str::<Self>(parts[1]) {
                    data = parsed;

                    content = parts[2].to_string();
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
