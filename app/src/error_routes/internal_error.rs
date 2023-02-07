use actix_web::{dev::ServiceResponse, middleware::ErrorHandlerResponse, Result};

pub fn internal_error<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let title = "Internal Error".to_string();
    let description = "An error occurred. Please try again later.".to_string();

    super::error(res, title, description)
}
