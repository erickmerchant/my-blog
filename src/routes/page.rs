use crate::{
    models::cache, models::page, routes::not_found, templates::minify_html, AppError, AppState,
};
use axum::{
    extract::Path, extract::State, http::header, response::Html, response::IntoResponse,
    response::Response,
};
use etag::EntityTag;
use minijinja::context;
use sea_orm::{entity::prelude::*, query::*, ActiveValue::Set};
use std::sync::Arc;

pub async fn page(
    State(app_state): State<Arc<AppState>>,
    Path((category, slug)): Path<(String, String)>,
) -> Result<Response, AppError> {
    let file = format!("{category}/{slug}");
    let cache_result: Option<cache::Model> = if envmnt::is("NO_CACHE") {
        None
    } else {
        cache::Entity::find()
            .filter(Condition::all().add(cache::Column::Path.eq(&file)))
            .one(&app_state.database.clone())
            .await?
    };

    let cache_result: Option<(String, Vec<u8>)> = match cache_result {
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

                    let html_bytes = html.as_bytes().to_vec();

                    let etag = EntityTag::from_data(&html_bytes).to_string();
                    let body = html_bytes;

                    if !envmnt::is("NO_CACHE") {
                        let cache_model = cache::ActiveModel {
                            path: Set(file),
                            etag: Set(etag.clone()),
                            body: Set(body.clone()),
                            ..Default::default()
                        };

                        cache_model.clone().insert(&app_state.database).await?;
                    };

                    Some((etag, body))
                }
                None => None,
            }
        }
        Some(cache_result) => Some((cache_result.etag, cache_result.body)),
    };

    match cache_result {
        None => Ok(not_found(State(app_state))),
        Some((etag, body)) => Ok(([(header::ETAG, etag)], Html(body)).into_response()),
    }
}
