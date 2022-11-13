use crate::{config, responses};
use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, web, Result};
use std::{fs::File, path::Path};

pub async fn asset(
    file: web::Path<String>,
    _config: web::Data<config::Config>,
) -> Result<NamedFile> {
    let src = Path::new("assets").join(file.to_string());
    let file = File::open(&src).map_err(ErrorInternalServerError)?;

    responses::file(file, src)
}
