use serde::Deserialize;
use std::{fs, path::Path, vec::Vec};

#[derive(Deserialize, Debug, Clone)]
pub struct Site {
  pub title: String,
  pub base: String,
  pub description: String,
  pub copyright: String,
  pub links: Vec<Link>,
  pub posts: Vec<String>,
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
  pub data: PostData,
  pub content: String,
}

impl Post {
  pub fn get_by_slug(slug: String) -> Option<Self> {
    let mut result = None;
    let path = Path::new("content/posts").join(slug).with_extension("html");
    if let Ok(contents) = fs::read_to_string(path) {
      let parts: Vec<&str> = contents.splitn(3, "===").collect();

      if parts.len() == 3 {
        if let (Some(data), Some(content)) = (parts.get(1), parts.get(2)) {
          if let Ok(data) = serde_json::from_str::<PostData>(data) {
            result = Some(Self {
              data,
              content: content.to_string(),
            });
          };
        };
      }
    }

    result
  }
}

#[derive(Deserialize, Debug, Clone)]
pub struct PostData {
  pub slug: String,
  pub title: String,
  pub date: String,
  pub description: String,
}
