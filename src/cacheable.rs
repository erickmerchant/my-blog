use crate::named_file;
use actix_files::NamedFile;
use actix_web::{error::Error, error::ErrorInternalServerError, Result};
use std::{convert::AsRef, fs, fs::File, io::Write, path::Path};

pub fn response<F: Fn() -> Result<String, Error>, P: AsRef<Path>>(
    src: P,
    process: F,
) -> Result<NamedFile> {
    let src = Path::new("storage/cache").join(src.as_ref());
    let file = match &src.exists() {
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
    };

    named_file::response(file, src)
}
