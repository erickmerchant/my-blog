use crate::{models::page, routes::not_found, templates::minify_html, AppError, AppState};
use axum::{
    extract::Path, extract::State, response::Html, response::IntoResponse, response::Response,
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{fs, path, sync::Arc};

pub async fn page(
    State(app_state): State<Arc<AppState>>,
    Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
    let cache_src = path::Path::new("storage/cache")
        .join(category.clone())
        .join(slug.clone());
    let cache_result = if envmnt::is("NO_CACHE") {
        None
    } else {
        fs::read_to_string(&cache_src).ok()
    };

    let code: Option<String> = match cache_result {
        None => {
            let page_category = category.clone();
            let page_slug = slug.clone();

            let page_slug = page_slug.trim_end_matches(".html");

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
                    let next = page::Entity::find()
                        .filter(page::Column::Category.eq(&page_category))
                        .cursor_by((page::Column::Date, page::Column::Id))
                        .order_by_desc(page::Column::Date)
                        .after((page.date, page.id))
                        .first(1)
                        .all(&app_state.database.clone())
                        .await?;

                    let previous = page::Entity::find()
                        .filter(page::Column::Category.eq(page_category))
                        .cursor_by((page::Column::Date, page::Column::Id))
                        .order_by_desc(page::Column::Date)
                        .before((page.date, page.id))
                        .last(1)
                        .all(&app_state.database.clone())
                        .await?;

                    let ctx = context! {
                        site => &app_state.site,
                        page => &page,
                        pagination => context! {
                            next => next.get(0),
                            previous => previous.get(0)
                        },
                    };

                    let html = app_state
                        .templates
                        .get_template(&page.template)
                        .and_then(|template| template.render(ctx))?;

                    let html = minify_html(html);

                    if let Some(parent) = cache_src.parent() {
                        fs::create_dir_all(parent).ok();
                        fs::write(&cache_src, &html).ok();
                    }

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
