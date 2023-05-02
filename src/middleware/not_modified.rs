use axum::{http::Request, http::StatusCode, middleware::Next, response::IntoResponse};
use etag::EntityTag;

pub async fn not_modified<B>(req: Request<B>, next: Next<B>) -> impl IntoResponse {
    let req_headers = req.headers().clone();
    let mut response = next.run(req).await;
    let headers = response.headers_mut();

    let mut not_modified = false;

    if let Some(etag_header) = headers.get("etag") {
        if let Ok(etag_header) = etag_header.to_str() {
            if let Some(if_none_match) = req_headers.get("if-none-match") {
                if let Ok(if_none_match) = if_none_match.to_str() {
                    let etag = etag_header.parse::<EntityTag>().expect("etag should parse");
                    let if_none_match = if_none_match
                        .parse::<EntityTag>()
                        .expect("if-none-match should parse");

                    if etag.weak_eq(&if_none_match) {
                        not_modified = true;
                    }
                }
            }
        }
    };

    match not_modified {
        true => (StatusCode::NOT_MODIFIED).into_response(),
        false => response,
    }
}
