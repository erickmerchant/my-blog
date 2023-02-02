use crate::Page;
use serde::{Deserialize, Serialize};

#[derive(Clone, Deserialize, Default, Debug, Serialize)]
pub struct Pagination {
    #[serde(default)]
    pub next: Option<Page>,
    #[serde(default)]
    pub previous: Option<Page>,
}
