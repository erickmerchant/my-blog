use actix_web::{dev::ServiceResponse, middleware::ErrorHandlerResponse, Result};

pub fn not_found<B>(res: ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    let title = "Page Not Found".to_string();
    let description = "That page was moved, removed, or never existed.".to_string();

    super::error(res, title, description)
}
