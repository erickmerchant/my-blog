use actix_files::NamedFile;
use actix_web::{error::ErrorNotFound, Result};
use std::{convert::AsRef, fs::File, path::Path};

pub fn response<P: AsRef<Path>>(file: File, src: P) -> Result<NamedFile> {
    let file = NamedFile::from_file(file, src).map_err(ErrorNotFound)?;
    let file = file
        .prefer_utf8(true)
        .use_etag(true)
        .use_last_modified(false)
        .disable_content_disposition();

    Ok(file)
}
