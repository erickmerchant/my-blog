use super::error;
use crate::models;
use actix_web::{dev::ServiceResponse, middleware::ErrorHandlerResponse, web, Result};
use tera::{Context, Tera};

pub fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let title = "Internal Error".to_string();
    let message = "An error occurred. Please try again later.".to_string();
    let req = res.request();
    let site = match req.app_data::<web::Data<models::Site>>() {
        Some(s) => s.as_ref().to_owned(),
        None => models::Site::default(),
    };
    let tmpl = req.app_data::<web::Data<Tera>>();

    let mut body = "".to_string();

    if let Some(t) = tmpl {
        let mut ctx = Context::new();
        ctx.insert("site", &site);
        ctx.insert("title", &title);
        ctx.insert("message", &message);

        if let Ok(b) = t.render("error.html", &ctx) {
            body = b
        }
    }

    error::response(res, body)
}
