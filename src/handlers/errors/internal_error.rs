use crate::responses;
use actix_web::{dev::ServiceResponse, middleware::ErrorHandlerResponse, Result};

pub fn handler<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let title = "Internal Error".to_string();
    let message = "An error occurred. Please try again later.".to_string();

    responses::error(res, title, message)
}
