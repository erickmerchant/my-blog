use glob::glob;
use serde::Deserialize;
use std::{
  fs,
  path::{Path, PathBuf},
  vec::Vec,
};

#[derive(Deserialize, Debug, Clone)]
pub struct Site {
  pub title: String,
  pub base: String,
  pub description: String,
  pub copyright: String,
  pub links: Vec<Link>,
}

impl Site {
  pub fn get() -> Self {
    let file_contents =
      fs::read_to_string("content/Site.json").expect("failed to read content/Site.json");

    serde_json::from_str::<Self>(&file_contents).expect("failed to parse content/Site.json")
  }
}

#[derive(Deserialize, Debug, Clone)]
pub struct Link {
  pub href: String,
  pub title: String,
}

#[derive(Deserialize, Debug, Clone)]
pub struct Post {
  pub slug: String,
  pub title: String,
  pub date: String,
  pub description: String,
  #[serde(default)]
  pub content: String,
}

impl Post {
  pub fn get_by_path(path: PathBuf) -> Option<Self> {
    let mut result = None;

    if let Ok(contents) = fs::read_to_string(path) {
      let parts = contents.splitn(3, "===").collect::<Vec<&str>>();

      if parts.len() == 3 {
        if let (Some(frontmatter), Some(content)) = (parts.get(1), parts.get(2)) {
          if let Ok(data) = serde_json::from_str::<Self>(frontmatter) {
            result = Some(Self {
              content: content.to_string(),
              ..data
            });
          };
        };
      }
    }

    result
  }

  pub fn get_by_slug(slug: String) -> Option<Self> {
    Self::get_by_path(Path::new("content/posts").join(slug).with_extension("html"))
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
