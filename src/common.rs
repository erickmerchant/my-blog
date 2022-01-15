use actix_files::NamedFile;
use actix_web::{
  error::{ErrorInternalServerError, ErrorNotFound},
  Result,
};
use std::{convert::AsRef, fs, path::Path};

pub fn dynamic_response<
  F: Fn(String) -> std::result::Result<String, E>,
  E: std::fmt::Debug + std::fmt::Display + 'static,
  P: AsRef<Path>,
>(
  src: P,
  cache: P,
  process: F,
) -> Result<NamedFile> {
  match fs::metadata(src.as_ref()) {
    Ok(src_metadata) => {
      let mut use_cache = false;

      if let Ok(cache_metadata) = fs::metadata(cache.as_ref()) {
        if let (Ok(cache_time), Ok(src_time)) = (cache_metadata.modified(), src_metadata.modified())
        {
          use_cache = cache_time > src_time;
        }
      }

      if !use_cache {
        let file_contents = fs::read_to_string(src)?;

        match process(file_contents) {
          Ok(body) => {
            fs::create_dir_all(cache.as_ref().with_file_name(""))?;

            fs::write(cache.as_ref(), body)?;

            Ok(())
          }
          Err(err) => {
            eprint!("{:?}", err);

            Err(ErrorInternalServerError(err))
          }
        }?
      }

      static_response(cache)
    }
    Err(err) => Err(ErrorNotFound(err)),
  }
}

pub fn static_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
  NamedFile::open(src)
    .and_then(|file| {
      Ok(
        file
          .prefer_utf8(true)
          .use_etag(true)
          .use_last_modified(true)
          .disable_content_disposition(),
      )
    })
    .or_else(|err| Err(ErrorNotFound(err)))
}
