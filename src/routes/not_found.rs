use crate::state::AppState;
use axum::{
    extract::State, http::StatusCode, response::Html, response::IntoResponse, response::Response,
};
use minijinja::context;
use std::sync::Arc;

pub fn not_found(State(app_state): State<Arc<AppState>>) -> Response {
    let title = "Page Not Found".to_string();
    let description = "That page was moved, removed, or never existed.".to_string();

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

    (StatusCode::NOT_FOUND, Html(body)).into_response()
}
