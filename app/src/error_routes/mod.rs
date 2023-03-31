mod internal_error;
mod not_found;

use crate::AppState;
use actix_web::{
    dev::ServiceResponse, http::header::HeaderName, http::header::HeaderValue,
    middleware::ErrorHandlerResponse, web, Result,
};
use minijinja::context;
use serde_json::json;

pub use self::{internal_error::*, not_found::*};

pub(self) fn error<B>(
    res: ServiceResponse<B>,
    title: String,
    description: String,
) -> Result<ErrorHandlerResponse<B>> {
    let req = res.request();
    let app_state = req.app_data::<web::Data<AppState>>();

    let mut body = "".to_string();

    if let Some(a) = app_state {
        let ctx = context! {
            page => json! ({
                "title": title,
                "description": description,
            })
        };

        if let Ok(template) = a.templates.get_template("layouts/error.jinja") {
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
