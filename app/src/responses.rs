use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, Result};
use std::{convert::AsRef, fs, fs::File, io, io::Write, path::Path};

pub struct Cache;

impl Cache {
    pub fn get<P: AsRef<Path>>(src: P) -> Option<io::Result<File>> {
        let src = Path::new("storage/cache").join(src.as_ref());

        match &src.exists() {
            false => None,
            true => Some(File::open(&src)),
        }
    }

    pub fn set<P: AsRef<Path>, B: AsRef<str>>(src: P, body: B) -> Result<File> {
        let src = Path::new("storage/cache").join(src.as_ref());

        fs::create_dir_all(src.with_file_name("")).map_err(ErrorInternalServerError)?;

        let mut file = File::options()
            .read(true)
            .append(true)
            .create(true)
            .open(&src)
            .map_err(ErrorInternalServerError)?;

        file.write_all(body.as_ref().as_bytes())
            .map_err(ErrorInternalServerError)?;

        Ok(file)
    }
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
