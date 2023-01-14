use crate::responses;
use actix_files::NamedFile;
use actix_web::{error::ErrorForbidden, error::ErrorNotFound, web, Result};
use std::{fs::File, path::Path};

pub async fn asset(file: web::Path<String>) -> Result<NamedFile> {
    if file.ends_with(".jinja") {
        Err(ErrorForbidden(""))
    } else {
        let src = Path::new("theme").join(file.to_string());

        let file = File::open(&src).map_err(ErrorNotFound)?;

        responses::file(file, src)
    }
}
