use axum::{http::StatusCode, response::IntoResponse, response::Response};

pub struct AppError(anyhow::Error);

impl IntoResponse for AppError {
	fn into_response(self) -> Response {
		(StatusCode::INTERNAL_SERVER_ERROR, self.0.to_string()).into_response()
	}
}

impl<E> From<E> for AppError
where
	E: Into<anyhow::Error>,
{
	fn from(err: E) -> Self {
		Self(err.into())
	}
}
