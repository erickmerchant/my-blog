use crate::common::{cacheable_response, render_content, CustomError};
use actix_files::NamedFile;
use actix_web::{web, Result};
use handlebars::Handlebars;
use serde::{Deserialize, Serialize};
use std::{fs, path::Path};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Post {
  title: String,
  description: String,
  content: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Feed {
  posts: std::collections::HashMap<String, Post>,
}

fn get_feed() -> serde_json::Value {
  let file_contents =
    fs::read_to_string("content/Posts.toml").expect("failed to read content/Posts.toml");
  let feed = toml::from_str::<Feed>(&file_contents).expect("failed to parse content/Posts.toml");
  serde_json::to_value(&feed).expect("failed to convert content/Posts.toml")
}

pub async fn home(hb: web::Data<Handlebars<'_>>) -> Result<NamedFile> {
  cacheable_response(Path::new("index.html"), || {
    let feed = get_feed();

    render_content(hb.clone(), Path::new("page/index.html"), &feed)
  })
}

pub async fn feed(hb: web::Data<Handlebars<'_>>) -> Result<NamedFile> {
  cacheable_response(Path::new("feed.rss"), || {
    let feed = get_feed();

    render_content(hb.clone(), Path::new("page/feed.rss"), &feed)
  })
}

pub async fn post(hb: web::Data<Handlebars<'_>>, post: web::Path<String>) -> Result<NamedFile> {
  let slug = Path::new(post.as_ref().as_str()).with_extension("");

  let slug = slug.to_str().expect("invalid slug");

  cacheable_response(post.as_ref().as_str(), || {
    let feed = get_feed();

    match feed
      .get("posts")
      .and_then(|posts| posts.get(slug))
      .and_then(|post| Some((post, post.get("content"))))
    {
      Some((post, Some(content))) => {
        match hb.render_template(content.as_str().unwrap_or_default(), &serde_json::json!({})) {
          Ok(rendered) => {
            let mut post = post.clone();

            post["content"] = serde_json::Value::String(rendered.to_string());

            render_content(
              hb.clone(),
              Path::new("page/post.html"),
              &serde_json::json!({ "post": post.to_owned() }),
            )
          }
          Err(err) => Err(CustomError::Internal {
            message: format!("{:?}", &err),
          }),
        }
      }
      _ => Err(CustomError::NotFound {}),
    }
  })
}
