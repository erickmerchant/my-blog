use crate::{models::cache, routes::css, routes::js, routes::not_found, AppError, AppState};
use axum::{
    extract::Path, extract::State, http::header, http::StatusCode, http::Uri,
    response::IntoResponse, response::Response,
};
use etag::EntityTag;
use sea_orm::{entity::prelude::*, query::*, ActiveValue::Set};
use std::{fs, path, sync::Arc};

pub async fn asset(
    State(app_state): State<Arc<AppState>>,
    file: Uri,
) -> Result<Response, AppError> {
    let file_string = &file.to_string();
    let extension = path::Path::new(file_string)
        .extension()
        .expect("it should have an extension")
        .to_str();
    let file = file_string.trim_start_matches('/').to_string();

    match extension {
        Some("jinja") => Ok((StatusCode::FORBIDDEN).into_response()),
        Some("js") => js(State(app_state), Path(file)).await,
        Some("css") => css(State(app_state), Path(file)).await,
        _ => {
            let cache_result: Option<cache::Model> = if envmnt::is("NO_CACHE") {
                None
            } else {
                cache::Entity::find()
                    .filter(Condition::all().add(cache::Column::Path.eq(&file)))
                    .one(&app_state.database.clone())
                    .await?
            };
            let src = path::Path::new("theme").join(&file);
            let mime_type = mime_guess::from_path(&src).first_or_text_plain();

            let cache_result: Option<(String, Vec<u8>)> = match cache_result {
                None => match fs::read(src) {
                    Err(_) => None,
                    Ok(file_contents) => {
                        let etag = EntityTag::from_data(&file_contents).to_string();
                        let body = file_contents;

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
                },
                Some(cache_result) => Some((cache_result.etag, cache_result.body)),
            };

            match cache_result {
                None => Ok(not_found(State(app_state))),
                Some((etag, body)) => Ok((
                    [
                        (header::CONTENT_TYPE, mime_type.as_ref()),
                        (header::ETAG, etag.as_str()),
                    ],
                    body,
                )
                    .into_response()),
            }
        }
    }
}
