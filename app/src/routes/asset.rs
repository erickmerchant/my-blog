use actix_files::NamedFile;
use actix_web::{error::ErrorNotFound, web, Result};
use std::{fs::File, path::Path};

pub async fn asset(file: web::Path<String>) -> Result<NamedFile> {
    if file.to_string().ends_with(".jinja") {
        return Err(ErrorNotFound(""));
    }

    let src = Path::new("theme").join(file.to_string());

    let file = File::open(&src).map_err(ErrorNotFound)?;

    super::file(file, src)
}
