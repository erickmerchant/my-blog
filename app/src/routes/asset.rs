use actix_files::NamedFile;
use actix_web::{error::ErrorNotFound, web, Result};
use std::{fs::File, path::Path};

pub async fn asset(file: web::Path<String>) -> Result<NamedFile> {
    let src = Path::new("theme").join(file.to_string());

    let file = File::options()
        .read(true)
        .open(&src)
        .map_err(ErrorNotFound)?;

    super::file(file, src)
}
