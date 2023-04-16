mod internal_error;
mod not_found;

use crate::AppState;
use axum::{http::StatusCode, response::Html, response::Response};
use minijinja::context;

pub use self::{internal_error::*, not_found::*};

pub fn error(
    app_state: AppState,
    status_code: StatusCode,
    title: String,
    description: String,
) -> Response {
    let mut body = "".to_string();

    let ctx = context! {
        site => app_state.site,
        page => context! {
            title => title,
            description => description,
        }
    };

    if let Ok(template) = app_state.templates.get_template("layouts/error.jinja") {
        if let Ok(b) = template.render(ctx) {
            body = b
        }
    }

    (status_code, Html(body)).into_response()
}
