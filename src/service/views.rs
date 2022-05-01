use super::models;
use crate::common::{html_response, CustomError};
use askama::Template;

#[derive(Template)]
#[template(path = "home.html")]
struct HomeTemplate {
  site: models::Site,
  title: String,
  posts: Vec<Option<models::Post>>,
}

#[derive(Template)]
#[template(path = "post.html")]
struct PostTemplate {
  site: models::Site,
  title: String,
  post: Option<models::Post>,
}

#[derive(Template)]
#[template(path = "not_found.html")]
struct NotFoundTemplate {
  site: models::Site,
  title: String,
}

#[derive(Template)]
#[template(path = "internal_error.html")]
struct InternalErrorTemplate {
  site: models::Site,
  title: String,
}

mod filters {
  pub fn format_date(d: &str) -> askama::Result<String> {
    Ok(match chrono::NaiveDate::parse_from_str(d, "%Y-%m-%d") {
      Ok(p) => p.format("%B %e, %Y").to_string(),
      Err(_) => d.to_string(),
    })
  }
}

pub fn home_page(
  site: models::Site,
  posts: Vec<Option<models::Post>>,
) -> Result<String, CustomError> {
  let title = "Home".to_string();

  match posts.len() > 1 {
    true => html_response(HomeTemplate {
      site: site,
      title: title,
      posts: posts,
    }),
    false => html_response(PostTemplate {
      site: site,
      title: title,
      post: posts.get(0).and_then(|p| p.clone()),
    }),
  }
}

pub fn post_page(site: models::Site, post: Option<models::Post>) -> Result<String, CustomError> {
  match post {
    Some(post) => html_response(PostTemplate {
      site: site,
      title: post.data.title.clone(),
      post: Some(post.clone()),
    }),
    None => Err(CustomError::NotFound {}),
  }
}

pub fn not_found() -> Result<String, CustomError> {
  let title = "Page Not Found".to_string();
  let site = models::Site::get();

  html_response(NotFoundTemplate {
    site: site,
    title: title,
  })
}

pub fn internal_error() -> Result<String, CustomError> {
  let title = "Internal Error".to_string();
  let site = models::Site::get();

  html_response(InternalErrorTemplate {
    site: site,
    title: title,
  })
}
