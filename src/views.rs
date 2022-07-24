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
#[template(path = "error.html")]
pub struct ErrorView {
    pub site: Site,
    pub title: String,
    pub message: String,
}

mod filters {
    pub fn format_date(d: &str, f: &str) -> askama::Result<String> {
        Ok(match chrono::NaiveDate::parse_from_str(d, "%Y-%m-%d") {
            Ok(p) => p.format(f).to_string(),
            Err(_) => d.to_string(),
        })
    }
}
