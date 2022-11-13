use actix_files::NamedFile;
use actix_web::error::ErrorNotFound;
use actix_web::{error::Error, error::ErrorInternalServerError, Result};
use std::{convert::AsRef, fs, fs::File, io::Write, path::Path};

pub fn cacheable<F: Fn() -> Result<String, Error>, P: AsRef<Path>>(
    src: P,
    process: F,
) -> Result<NamedFile> {
    let src = Path::new("storage/cache").join(src.as_ref());

    file(
        match &src.exists() {
            false => {
                let body = process()?;

                fs::create_dir_all(&src.with_file_name("")).map_err(ErrorInternalServerError)?;

                let mut file = File::options()
                    .read(true)
                    .append(true)
                    .create(true)
                    .open(&src)
                    .map_err(ErrorInternalServerError)?;

                file.write_all(body.as_bytes())
                    .map_err(ErrorInternalServerError)?;

                file
            }
            true => File::open(&src).map_err(ErrorInternalServerError)?,
        },
        src,
    )
}

pub fn file<P: AsRef<Path>>(file: File, src: P) -> Result<NamedFile> {
    let file = NamedFile::from_file(file, src).map_err(ErrorNotFound)?;
    let file = file
        .prefer_utf8(true)
        .use_etag(true)
        .use_last_modified(false)
        .disable_content_disposition();

    Ok(file)
}
