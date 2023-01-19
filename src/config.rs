use clap::Parser;
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Parser, Debug, Clone)]
#[command(version, long_about = None)]
pub struct ServerConfig {
    #[arg(long, default_value_t = 8080)]
    pub port: u16,
}

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetsConfig {
    #[serde(default)]
    pub source_maps: bool,
    #[serde(default = "AssetsConfig::get_default_targets")]
    pub targets: String,
    #[serde(default = "AssetsConfig::get_default_pragma")]
    pub pragma: String,
    #[serde(default = "AssetsConfig::get_default_pragma_frag")]
    pub pragma_frag: String,
}

impl AssetsConfig {
    pub fn get_default_targets() -> String {
        "supports es6-module and last 2 versions".to_string()
    }
    pub fn get_default_pragma() -> String {
        "h".to_string()
    }
    pub fn get_default_pragma_frag() -> String {
        "fragment".to_string()
    }
    pub fn get() -> Self {
        match fs::read_to_string("assets/assets.config.json") {
            Ok(file_contents) => serde_json::from_str::<Self>(&file_contents)
                .expect("failed to parse assets/assets.config.json"),
            _ => Self::default(),
        }
    }
}
