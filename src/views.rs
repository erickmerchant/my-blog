use crate::models::*;

use askama::Template;

#[derive(Template)]
#[template(path = "posts.rss", escape = "xml")]
pub struct FeedView {
    pub site: Site,
    pub posts: Vec<Post>,
}

#[derive(Template)]
#[template(path = "home.html")]
pub struct HomeView {
    pub site: Site,
    pub title: String,
    pub posts: Vec<Post>,
}

#[derive(Template)]
#[template(path = "post.html")]
pub struct PostView {
    pub site: Site,
    pub title: String,
    pub post: Post,
}

#[derive(Template)]
#[template(path = "not_found.html")]
pub struct NotFoundView {
    pub site: Site,
    pub title: String,
}

#[derive(Template)]
#[template(path = "internal_error.html")]
pub struct InternalErrorView {
    pub site: Site,
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
