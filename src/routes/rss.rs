use crate::{models::cache, models::page, routes::not_found, AppError, AppState};
use axum::{
    extract::Path, extract::State, http::header, response::IntoResponse, response::Response,
};
use etag::EntityTag;
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*, ActiveValue::Set};
use std::{sync::Arc, vec::Vec};

pub async fn rss(
    State(app_state): State<Arc<AppState>>,
    Path(category): Path<String>,
) -> Result<Response, AppError> {
    let cache_result: Option<cache::Model> = if envmnt::is("NO_CACHE") {
        None
    } else {
        cache::Entity::find()
            .filter(Condition::all().add(cache::Column::Path.eq(&category)))
            .one(&app_state.database.clone())
            .await?
    };

    let cache_result: Option<(String, Vec<u8>)> = match cache_result {
        None => {
            let pages: Vec<page::Model> = page::Entity::find()
                .filter(page::Column::Category.eq(&category))
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

            let rss_bytes = rss.as_bytes().to_vec();

            let etag = EntityTag::from_data(&rss_bytes).to_string();
            let body = rss_bytes;

            if !envmnt::is("NO_CACHE") {
                let cache_model = cache::ActiveModel {
                    path: Set(category.clone()),
                    etag: Set(etag.clone()),
                    body: Set(body.clone()),
                    ..Default::default()
                };

                cache_model.clone().insert(&app_state.database).await?;
            };

            Some((etag, body))
        }
        Some(cache_result) => Some((cache_result.etag, cache_result.body)),
    };

    match cache_result {
        None => Ok(not_found(State(app_state))),
        Some((etag, body)) => Ok((
            [
                (header::CONTENT_TYPE, "application/rss+xml".to_string()),
                (header::ETAG, etag),
            ],
            body,
        )
            .into_response()),
    }
}
