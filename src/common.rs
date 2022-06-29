use actix_files::NamedFile;
use actix_web::{error, http::StatusCode, Result};
use askama::Template;
use derive_more::{Display, Error};
use std::{convert::AsRef, fs, path::Path};

pub fn cacheable_response<F: Fn() -> Result<String, CustomError>, P: AsRef<Path>>(
    src: P,
    process: F,
) -> Result<NamedFile> {
    let cache = Path::new("storage/cache").join(src.as_ref());

    if let Err(_meta) = fs::metadata(&cache) {
        let body = process()?;

        fs::create_dir_all(&cache.with_file_name("")).map_err(CustomError::new_internal)?;
        fs::write(&cache, body).map_err(CustomError::new_internal)?;
    }

    static_response(cache)
}

pub fn static_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
    let file = NamedFile::open(src).map_err(|_| CustomError::NotFound)?;
    let file = file
        .prefer_utf8(true)
        .use_etag(true)
        .use_last_modified(true)
        .disable_content_disposition();

    Ok(file)
}

pub fn render_template(html: impl Template) -> Result<String, CustomError> {
    Ok(html.render().unwrap_or_default())
}

#[derive(Debug, Display, Error)]
pub enum CustomError {
    NotFound,
    Internal {},
}

impl CustomError {
    pub fn new_internal<E: std::fmt::Debug>(err: E) -> Self {
        log::error!("{err:?}");

        Self::Internal {}
    }

    pub fn new_not_found<E: std::fmt::Debug>(err: E) -> Self {
        log::error!("{err:?}");

        Self::NotFound
    }
}

impl error::ResponseError for CustomError {
    fn status_code(&self) -> StatusCode {
        match self {
            Self::NotFound => StatusCode::NOT_FOUND,
            Self::Internal {} => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}
