use super::index::index;
use crate::AppState;
use actix_files::NamedFile;
use actix_web::{web, Result};

pub async fn posts_index(app_state: web::Data<AppState>) -> Result<NamedFile> {
    index(app_state, web::Path::from("posts".to_string())).await
}
