use glob::glob;
use nipper::Document;
use serde::Deserialize;
use std::{fs, path::Path, vec::Vec};

#[derive(Deserialize, Debug, Clone, Default)]
pub struct Site {
    pub title: String,
    pub base: String,
    pub description: String,
    pub copyright: String,
    pub links: Vec<Link>,
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

#[derive(Deserialize, Debug, Clone)]
pub struct Link {
    pub href: String,
    pub title: String,
}

#[derive(Deserialize, Debug, Clone, Default)]
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
            let document = Document::from(contents.as_str());

            let mut frontmatter_node = document.select("json-frontmatter").first();

            let mut data = Self::default();

            if frontmatter_node.exists() {
                let json = frontmatter_node.text();

                frontmatter_node.remove();

                if let Ok(parsed) = serde_json::from_str::<Self>(&json) {
                    data = parsed;
                }
            };

            let code_blocks = document.select("code-block");

            for mut code_block in code_blocks.iter() {
                let text = code_block.text();
                let text = text.trim();

                code_block.set_html("<pre></pre>");

                let mut pre = code_block.select("pre").first();

                for ln in text.split('\n') {
                    pre.append_html(format!("<code>{ln}\n</code>"))
                }
            }

            let content = document.html();

            result = Some(Self {
                slug,
                content: content.to_string(),
                ..data
            });
        }

        result
    }

    pub fn get_all() -> Vec<Self> {
        let mut posts = Vec::<Self>::new();

        if let Ok(entries) = glob("content/posts/*.html") {
            for entry in entries.into_iter().flatten() {
                if let Some(slug) = entry.file_stem().and_then(|slug| slug.to_str()) {
                    if let Some(post) = Self::get_by_slug(String::from(slug)) {
                        posts.push(post);
                    }
                }
            }
        }

        posts.sort_by(|a, b| b.date.cmp(&a.date));

        posts
    }
}
