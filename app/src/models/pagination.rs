use super::Page;
use serde::{Deserialize, Serialize};

#[derive(Clone, Deserialize, Serialize)]
pub struct Pagination {
    #[serde(default)]
    pub next: Option<Page>,
    #[serde(default)]
    pub previous: Option<Page>,
}
