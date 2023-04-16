use axum::extract;
use std::{fs::File, path::Path};

pub async fn asset(extract::Path(file): extract::Path<String>) -> Result<NamedFile> {
    match file.to_string().ends_with(".jinja") {
        true => Err(ErrorNotFound("not found")),
        false => {
            let src = Path::new("theme").join(file.to_string());

            let file = File::options()
                .read(true)
                .open(&src)
                .map_err(ErrorNotFound)?;

            super::file(file, src)
        }
    }
}
