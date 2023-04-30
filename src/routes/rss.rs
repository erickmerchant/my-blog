use crate::{cache::Cache, models::page, routes::not_found, AppError, AppState};
use axum::{
    extract::Path, extract::State, http::header, response::IntoResponse, response::Response,
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{sync::Arc, vec::Vec};

pub async fn rss(
    State(app_state): State<Arc<AppState>>,
    Path(category): Path<String>,
) -> Result<Response, AppError> {
    let cache = Cache::new(&category);
    let cache_result = cache.read();

    let code: Option<String> = match cache_result {
        None => {
            let pages: Vec<page::Model> = page::Entity::find()
                .filter(page::Column::Category.eq(category))
                .order_by_desc(page::Column::Date)
                .all(&app_state.database.clone())
                .await?;

            let ctx = context! {
                site => &app_state.site,
                pages => pages,
            };
            let rss = app_state
                .templates
                .get_template("layouts/rss.jinja")
                .and_then(|template| template.render(ctx))?;

            cache.write(&rss);

            Some(rss)
        }
        Some(code) => Some(code),
    };

    match code {
        None => Ok(not_found(State(app_state))),
        Some(code) => Ok(([(header::CONTENT_TYPE, "application/rss+xml")], code).into_response()),
    }
}
