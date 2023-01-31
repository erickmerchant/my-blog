use crate::Page;
use serde::{Deserialize, Serialize};

#[derive(Clone, Deserialize, Debug, Serialize)]
pub struct Pagination {
    #[serde(default)]
    pub next: Option<Page>,
    #[serde(default)]
    pub previous: Option<Page>,
}

impl Default for Pagination {
    fn default() -> Self {
        Self {
            next: None,
            previous: None,
        }
    }
}
