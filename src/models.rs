use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs, vec::Vec};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Site {
  pub title: String,
  pub base: String,
  pub description: String,
  pub copyright: String,
  pub links: Vec<Link>,
}

impl Readable for Site {
  fn read() -> Site {
    let file_contents =
      fs::read_to_string("content/Site.toml").expect("failed to read content/Site.toml");
    let content =
      toml::from_str::<Site>(&file_contents).expect("failed to parse content/Site.toml");

    content
  }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Blog {
  pub posts: HashMap<String, Post>,
}

impl Readable for Blog {
  fn read() -> Blog {
    let file_contents =
      fs::read_to_string("content/Blog.toml").expect("failed to read content/Blog.toml");
    let content =
      toml::from_str::<Blog>(&file_contents).expect("failed to parse content/Blog.toml");

    content
  }
}

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

pub trait Readable {
  fn read() -> Self;
}
