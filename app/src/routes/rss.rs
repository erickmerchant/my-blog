use crate::{models::page, AppError, AppState};
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
    // let src = path::Path::new(category.as_str()).with_extension("rss");

    let pages: Vec<page::Model> = page::Entity::find()
        .filter(page::Column::Category.eq(category.as_str()))
        .order_by_desc(page::Column::Date)
        .all(&app_state.database.clone())
        .await?;

    let ctx = context! {
        site => &app_state.site,
        pages => pages,
    };
    let html = app_state
        .templates
        .get_template("layouts/rss.jinja")
        .and_then(|template| template.render(ctx))?;

    Ok(([(header::CONTENT_TYPE, "application/rss+xml")], html).into_response())
}
