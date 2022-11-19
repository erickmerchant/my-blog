use serde::Deserialize;
use std::env;

#[derive(Deserialize, Debug, Clone)]
pub struct Config {
    pub source_maps: bool,
    pub port: u16,
    pub targets: String,
}

impl Config {
    pub fn new() -> Self {
        Self {
            source_maps: env::var("SOURCE_MAPS")
                .map(|val| val == *"true")
                .unwrap_or(false),
            port: env::var("PORT")
                .map(|val| val.parse::<u16>().unwrap_or(8080))
                .unwrap_or(8080),
            targets: env::var("TARGETS")
                .unwrap_or_else(|_| String::from("supports es6-module and last 2 versions")),
        }
    }
}
