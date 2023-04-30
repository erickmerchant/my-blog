use crate::{
    cache::Cache, models::page, routes::not_found, templates::minify_html, AppError, AppState,
};
use axum::{
    extract::Path, extract::State, response::Html, response::IntoResponse, response::Response,
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{sync::Arc, vec::Vec};

pub async fn index(
    State(app_state): State<Arc<AppState>>,
    Path(category): Path<String>,
) -> Result<Response, AppError> {
    let cache = Cache::new(&category);
    let cache_result = cache.read();

    let code: Option<String> = match cache_result {
        None => {
            let pages: Vec<page::Model> = page::Entity::find()
                .filter(page::Column::Category.eq(&category))
                .order_by_desc(page::Column::Date)
                .all(&app_state.database.clone())
                .await?;

            let pages_index_page: Option<page::Model> = page::Entity::find()
                .filter(
                    Condition::all()
                        .add(page::Column::Category.eq(""))
                        .add(page::Column::Slug.eq(category)),
                )
                .order_by_desc(page::Column::Date)
                .one(&app_state.database.clone())
                .await?;

            match !pages.is_empty() && pages_index_page.is_some() {
                true => {
                    let ctx = context! {
                        site => &app_state.site,
                        page => &pages_index_page,
                        pages => &pages,
                    };

                    let html = app_state
                        .templates
                        .get_template("layouts/index.jinja")
                        .and_then(|template| template.render(ctx))?;

                    let html = minify_html(html);

                    cache.write(&html);

                    Some(html)
                }
                false => None,
            }
        }
        Some(code) => Some(code),
    };

    match code {
        None => Ok(not_found(State(app_state))),
        Some(code) => Ok(Html(code).into_response()),
    }
}