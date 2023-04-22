use crate::{models::page, routes::not_found, templates::minify_html, AppError, AppState};
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
    let src = "index.html";

    let pages: Vec<page::Model> = page::Entity::find()
        .filter(page::Column::Category.eq(category.as_str()))
        .order_by_desc(page::Column::Date)
        .all(&app_state.database.clone())
        .await?;

    let pages_index_page: Option<page::Model> = page::Entity::find()
        .filter(
            Condition::all()
                .add(page::Column::Category.eq(""))
                .add(page::Column::Slug.eq(category.as_str())),
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

            Ok(Html(html).into_response())
        }
        false => Ok(not_found(State(app_state))),
    }
}
