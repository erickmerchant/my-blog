use crate::{
    models::page, routes::not_found, routes::rss, templates::minify_html, AppError, AppState,
};
use axum::{
    extract::Path, extract::State, response::Html, response::IntoResponse, response::Response,
};
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*};
use std::{fs, path, sync::Arc, vec::Vec};

pub async fn index(
    State(app_state): State<Arc<AppState>>,
    Path(category): Path<String>,
) -> Result<Response, AppError> {
    if category.ends_with(".rss") {
        rss(State(app_state), Path(category)).await
    } else if category.ends_with(".html") {
        let cache_src = path::Path::new("storage/cache").join(category.clone());

        let code: Option<String> = match fs::read_to_string(&cache_src) {
            Err(_) => {
                let category = category.trim_end_matches(".html");

                let pages: Vec<page::Model> = page::Entity::find()
                    .filter(page::Column::Category.eq(category))
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
                            page => &pages_index_page.unwrap(),
                            pages => &pages,
                        };

                        let html = app_state
                            .templates
                            .get_template("layouts/index.jinja")
                            .and_then(|template| template.render(ctx))?;

                        let html = minify_html(html);

                        fs::create_dir_all(cache_src.parent().unwrap()).ok();
                        fs::write(&cache_src, &html).ok();

                        Some(html)
                    }
                    false => None,
                }
            }
            Ok(code) => Some(code),
        };

        match code {
            None => Ok(not_found(State(app_state))),
            Some(code) => Ok(Html(code).into_response()),
        }
    } else {
        Ok(not_found(State(app_state)))
    }
}
