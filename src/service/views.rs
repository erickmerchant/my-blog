use super::models;
use askama::Template;

#[derive(Template)]
#[template(path = "feed.rss", escape = "xml")]
pub struct FeedTemplate {
  pub site: models::Site,
  pub posts: Vec<Option<models::Post>>,
}

#[derive(Template)]
#[template(path = "home.html")]
pub struct HomeTemplate {
  pub site: models::Site,
  pub title: String,
  pub posts: Vec<Option<models::Post>>,
}

#[derive(Template)]
#[template(path = "post.html")]
pub struct PostTemplate {
  pub site: models::Site,
  pub title: String,
  pub post: Option<models::Post>,
}

#[derive(Template)]
#[template(path = "not_found.html")]
pub struct NotFoundTemplate {
  pub site: models::Site,
  pub title: String,
}

#[derive(Template)]
#[template(path = "internal_error.html")]
pub struct InternalErrorTemplate {
  pub site: models::Site,
  pub title: String,
}

mod filters {
  pub fn format_date(d: &str) -> askama::Result<String> {
    Ok(match chrono::NaiveDate::parse_from_str(d, "%Y-%m-%d") {
      Ok(p) => p.format("%B %e, %Y").to_string(),
      Err(_) => d.to_string(),
    })
  }
}
