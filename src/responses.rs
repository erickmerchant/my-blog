use crate::models::site::*;
use actix_files::NamedFile;
use actix_web::{
    dev::ServiceResponse, error::Error, error::ErrorInternalServerError, error::ErrorNotFound,
    http::header::HeaderName, http::header::HeaderValue, middleware::ErrorHandlerResponse, web,
    Result,
};
use minijinja::{context, Environment};
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

                fs::create_dir_all(src.with_file_name("")).map_err(ErrorInternalServerError)?;

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

pub fn error<B>(
    res: ServiceResponse<B>,
    title: String,
    message: String,
) -> Result<ErrorHandlerResponse<B>> {
    let req = res.request();
    let site = match req.app_data::<web::Data<Site>>() {
        Some(s) => s.as_ref().to_owned(),
        None => Site::default(),
    };
    let template_env = req.app_data::<web::Data<Environment>>();

    let mut body = "".to_string();

    if let Some(t) = template_env {
        let ctx = context! {
            site => &site,
            title => title,
            message => message
        };

        if let Ok(template) = t.get_template("error.jinja") {
            if let Ok(b) = template.render(ctx) {
                body = b
            }
        }
    }

    let (req, res) = res.into_parts();
    let res = res.set_body(body);
    let mut res = ServiceResponse::new(req, res)
        .map_into_boxed_body()
        .map_into_right_body();
    let headers = res.headers_mut();

    headers.insert(
        HeaderName::from_static("content-type"),
        HeaderValue::from_static("text/html; charset=utf-8"),
    );

    let res = ErrorHandlerResponse::Response(res);

    Ok(res)
}
