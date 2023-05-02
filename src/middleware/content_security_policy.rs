use axum::{http::header, http::Request, middleware::Next, response::IntoResponse};

pub async fn content_security_policy<B>(req: Request<B>, next: Next<B>) -> impl IntoResponse {
    let mut response = next.run(req).await;
    let headers = response.headers_mut();
    headers.insert(
        header::CONTENT_SECURITY_POLICY,
        header::HeaderValue::from_str("default-src 'self'")
            .expect("content security policy str should be valid header value"),
    );
    response
}
