mod asset;
mod css;
mod js;
mod page;
mod posts_index;
mod posts_rss;

use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, Result};
use std::{convert::AsRef, env::var, fs, fs::File, io, io::Write, path::Path};

pub use self::{asset::*, css::*, js::*, page::*, posts_index::*, posts_rss::*};

pub struct Cache;

impl Cache {
    pub fn get<P: AsRef<Path>>(src: P) -> Option<io::Result<File>> {
        let mut no_cache = false;

        if let Ok(v) = var("NO_CACHE") {
            if v.to_lowercase() == "true" {
                no_cache = true;
            }
        };

        if no_cache {
            None
        } else {
            let src = Path::new("storage/cache").join(src.as_ref());

            match &src.exists() {
                false => None,
                true => Some(File::open(&src)),
            }
        }
    }

    pub fn set<P: AsRef<Path>, B: AsRef<str>>(src: P, body: B) -> Result<File> {
        let src = Path::new("storage/cache").join(src.as_ref());

        fs::create_dir_all(src.with_file_name("")).map_err(ErrorInternalServerError)?;

        let mut file = File::options()
            .read(true)
            .write(true)
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
