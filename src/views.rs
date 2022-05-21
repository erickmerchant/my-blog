use crate::models;
use askama::Template;

#[derive(Template)]
#[template(path = "posts.rss", escape = "xml")]
pub struct Feed {
  pub site: models::Site,
  pub posts: Vec<models::Post>,
}

#[derive(Template)]
#[template(path = "home.html")]
pub struct Home {
  pub site: models::Site,
  pub title: String,
  pub posts: Vec<models::Post>,
}

#[derive(Template)]
#[template(path = "post.html")]
pub struct Post {
  pub site: models::Site,
  pub title: String,
  pub post: models::Post,
}

#[derive(Template)]
#[template(path = "not_found.html")]
pub struct NotFound {
  pub site: models::Site,
  pub title: String,
}

#[derive(Template)]
#[template(path = "internal_error.html")]
pub struct InternalError {
  pub site: models::Site,
  pub title: String,
}

mod filters {
  pub fn format_date(d: &str, f: &str) -> askama::Result<String> {
    Ok(match chrono::NaiveDate::parse_from_str(d, "%Y-%m-%d") {
      Ok(p) => p.format(f).to_string(),
      Err(_) => d.to_string(),
    })
  }
}
