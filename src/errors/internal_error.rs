use super::error;
use crate::models;
use actix_web::{dev::ServiceResponse, middleware::ErrorHandlerResponse, web, Result};
use minijinja::{context, Environment};

pub fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let title = "Internal Error".to_string();
    let message = "An error occurred. Please try again later.".to_string();
    let req = res.request();
    let site = match req.app_data::<web::Data<models::Site>>() {
        Some(s) => s.as_ref().to_owned(),
        None => models::Site::default(),
    };
    let template_env = req.app_data::<web::Data<Environment>>();

    let mut body = "".to_string();

    if let Some(t) = template_env {
        let ctx = context! {
            site => &site,
            title => &title,
            message => &message
        };

        if let Ok(template) = t.get_template("error.html") {
            if let Ok(b) = template.render(ctx) {
                body = b
            }
        }
    }

    error::response(res, body)
}
