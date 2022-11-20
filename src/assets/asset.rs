use crate::{config, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorNotFound, web, Result};
use std::{fs::File, path::Path};

pub async fn asset(
    file: web::Path<String>,
    _config: web::Data<config::Config>,
) -> Result<NamedFile> {
    let src = Path::new("assets").join(file.to_string());
    let file = File::open(&src).map_err(ErrorNotFound)?;

    responses::file(file, src)
}
