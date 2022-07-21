use crate::models::*;

use actix_web::{error::Error, error::ErrorInternalServerError};
use askama::Template;

#[derive(Template)]
#[template(path = "posts.rss", escape = "xml")]
pub struct FeedView {
    pub site: Site,
    pub posts: Vec<Post>,
}

impl View for FeedView {}

#[derive(Template)]
#[template(path = "home.html")]
pub struct HomeView {
    pub site: Site,
    pub title: String,
    pub posts: Vec<Post>,
}

impl View for HomeView {
    fn to_result(&self) -> Result<String, Error> {
        to_minified_result(self)
    }
}

#[derive(Template)]
#[template(path = "post.html")]
pub struct PostView {
    pub site: Site,
    pub title: String,
    pub post: Post,
}

impl View for PostView {
    fn to_result(&self) -> Result<String, Error> {
        to_minified_result(self)
    }
}

#[derive(Template)]
#[template(path = "not_found.html")]
pub struct NotFoundView {
    pub site: Site,
    pub title: String,
}

impl View for NotFoundView {}

#[derive(Template)]
#[template(path = "internal_error.html")]
pub struct InternalErrorView {
    pub site: Site,
    pub title: String,
}

impl View for InternalErrorView {}

mod filters {
    pub fn format_date(d: &str, f: &str) -> askama::Result<String> {
        Ok(match chrono::NaiveDate::parse_from_str(d, "%Y-%m-%d") {
            Ok(p) => p.format(f).to_string(),
            Err(_) => d.to_string(),
        })
    }
}

fn to_minified_result(view: &impl Template) -> Result<String, Error> {
    use minify_html::{minify, Cfg};

    let code = view.render().map_err(ErrorInternalServerError)?;
    let cfg = Cfg::spec_compliant();
    let minified = minify(code.as_bytes(), &cfg);

    String::from_utf8(minified).map_err(ErrorInternalServerError)
}

pub trait View: Template {
    fn to_result(&self) -> Result<String, Error> {
        let code = self.render().map_err(ErrorInternalServerError)?;

        Ok(code)
    }
}
