use crate::responses;
use actix_web::{dev::ServiceResponse, middleware::ErrorHandlerResponse, Result};

pub fn handler<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let title = "Page Not Found".to_string();
    let message = "That resource was moved, removed, or never existed.".to_string();

    responses::error(res, title, message)
}
