use crate::{
    cache::Cache, models::page, routes::not_found, templates::minify_html, AppError, AppState,
};
use axum::{
    extract::Path, extract::State, response::Html, response::IntoResponse, response::Response,
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{path, sync::Arc};

pub async fn page(
    State(app_state): State<Arc<AppState>>,
    Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
    let file = path::Path::new("")
        .join(category.clone())
        .join(slug.clone());
    let cache = Cache::new(&file);
    let cache_result = cache.read();

    let code: Option<String> = match cache_result {
        None => {
            let page_category = category.clone();
            let page_slug = slug.clone();

            let page: Option<page::Model> = page::Entity::find()
                .filter(
                    Condition::all()
                        .add(page::Column::Category.eq(&page_category))
                        .add(page::Column::Slug.eq(page_slug)),
                )
                .order_by_desc(page::Column::Date)
                .one(&app_state.database.clone())
                .await?;

            match page {
                Some(page) => {
                    let ctx = context! {
                        site => &app_state.site,
                        page => &page,
                    };

                    let html = app_state
                        .templates
                        .get_template(&page.template)
                        .and_then(|template| template.render(ctx))?;

                    let html = minify_html(html);

                    cache.write(&html);

                    Some(html)
                }
                None => None,
            }
        }
        Some(code) => Some(code),
    };

    match code {
        None => Ok(not_found(State(app_state))),
        Some(code) => Ok(Html(code).into_response()),
    }
}
