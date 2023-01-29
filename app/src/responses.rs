use actix_files::NamedFile;
use actix_web::{
    dev::ServiceResponse, error::ErrorInternalServerError, error::ErrorNotFound,
    http::header::HeaderName, http::header::HeaderValue, middleware::ErrorHandlerResponse, web,
    Result,
};
use minijinja::{context, Environment};
use schema::*;
use std::{convert::AsRef, fs, fs::File, io, io::Write, path::Path};

pub struct Cache {}

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

pub fn error<B>(
    res: ServiceResponse<B>,
    title: String,
    description: String,
) -> Result<ErrorHandlerResponse<B>> {
    let req = res.request();
    let template_env = req.app_data::<web::Data<Environment>>();

    let mut body = "".to_string();

    if let Some(t) = template_env {
        let page = Page {
            title,
            description,
            ..Page::default()
        };

        let ctx = context! {
            page => page
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
