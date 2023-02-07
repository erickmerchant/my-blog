mod internal_error;
mod not_found;

use crate::models::*;
use actix_web::{
    dev::ServiceResponse, http::header::HeaderName, http::header::HeaderValue,
    middleware::ErrorHandlerResponse, web, Result,
};
use minijinja::{context, Environment};

pub use self::{internal_error::*, not_found::*};

pub(self) fn error<B>(
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

        if let Ok(template) = t.get_template("pages/error.jinja") {
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
