use actix_web::{
    dev::ServiceResponse, http::header::HeaderName, http::header::HeaderValue,
    middleware::ErrorHandlerResponse, Result,
};

pub fn response<B>(res: ServiceResponse<B>, body: String) -> Result<ErrorHandlerResponse<B>> {
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
