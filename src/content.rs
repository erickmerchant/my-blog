use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs, vec::Vec};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Post {
  pub title: String,
  pub description: String,
  pub content: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Link {
  pub href: String,
  pub title: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Site {
  pub title: String,
  pub base: String,
  pub description: String,
  pub copyright: String,
  pub links: Vec<Link>,
  pub posts: HashMap<String, Post>,
}

pub fn get_site_content() -> Site {
  let file_contents =
    fs::read_to_string("content/Site.toml").expect("failed to read content/Site.toml");
  let content = toml::from_str::<Site>(&file_contents).expect("failed to parse content/Site.toml");

  content
}
