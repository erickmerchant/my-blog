use crate::{models::page, routes::not_found, AppError, AppState};
use axum::{
    extract::Path, extract::State, http::header, response::IntoResponse, response::Response,
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{fs, path, sync::Arc, vec::Vec};

pub async fn rss(
    State(app_state): State<Arc<AppState>>,
    Path(category): Path<String>,
) -> Result<Response, AppError> {
    let cache_src = path::Path::new("storage/cache")
        .join(category.clone())
        .with_extension("rss");

    let code: Option<String> = match fs::read_to_string(&cache_src) {
        Err(_) => {
            let category = category.trim_end_matches(".rss");

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

            fs::create_dir_all(cache_src.parent().unwrap()).ok();
            fs::write(&cache_src, &rss).ok();

            Some(rss)
        }
        Ok(code) => Some(code),
    };

    match code {
        None => Ok(not_found(State(app_state))),
        Some(code) => Ok(([(header::CONTENT_TYPE, "application/rss+xml")], code).into_response()),
    }
}
