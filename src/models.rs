use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use std::{fs, vec::Vec};
use wax::Glob;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Site {
  pub title: String,
  pub base: String,
  pub description: String,
  pub copyright: String,
  pub links: Vec<Link>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Link {
  pub href: String,
  pub title: String,
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

pub struct Blog {
  pub posts: Vec<Post>,
}

pub struct Post {
  pub slug: String,
  pub date: NaiveDate,
  pub title: String,
  pub description: String,
  pub content: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PostFrontmatter {
  pub title: String,
  pub description: String,
}

impl Readable for Blog {
  fn read() -> Blog {
    let mut blog = Blog { posts: vec![] };

    let glob = Glob::new("*.html").expect("failed glob *.html");

    for entry in glob.walk("content/Blog.posts", usize::MAX) {
      let entry = entry.expect("failed to walk posts");
      let path = entry.path();
      let file_name = path.with_extension("");

      let params: Vec<&str> = file_name
        .file_name()
        .expect("failed to get file name")
        .to_str()
        .expect("failed to get str")
        .splitn(4, '-')
        .collect();

      if params.len() == 4 {
        let contents = fs::read_to_string(path).expect("failed to read contents");

        let parts: Vec<&str> = contents.splitn(3, "+++").collect();

        if parts.len() == 3 {
          if let (
            Some(year),
            Some(month),
            Some(day),
            Some(slug),
            Some(frontmatter),
            Some(content),
          ) = (
            params.get(0),
            params.get(1),
            params.get(2),
            params.get(3),
            parts.get(1),
            parts.get(2),
          ) {
            if let (Ok(year), Ok(month), Ok(day), Ok(frontmatter)) = (
              year.parse::<i32>(),
              month.parse::<u32>(),
              day.parse::<u32>(),
              toml::from_str::<PostFrontmatter>(frontmatter),
            ) {
              let date = NaiveDate::from_ymd(year, month, day);

              let post = Post {
                slug: slug.to_string(),
                date: date,
                title: frontmatter.title,
                description: frontmatter.description,
                content: content.to_string(),
              };

              blog.posts.push(post);
            };
          };
        }
      }
    }

    blog
  }
}

pub trait Readable {
  fn read() -> Self;
}
