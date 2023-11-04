pub mod args;
pub mod error;
pub mod layers;
pub mod models;
pub mod routes;
pub mod site;
pub mod state;
pub mod templates;
pub mod views;

pub static DATABASE_URL: &str = "sqlite://./storage/content.db";
