use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThemeConfig {
    #[serde(default = "ThemeConfig::get_default_targets")]
    pub targets: String,
    #[serde(default = "ThemeConfig::get_default_pragma")]
    pub pragma: String,
    #[serde(default = "ThemeConfig::get_default_pragma_frag")]
    pub pragma_frag: String,
}

impl ThemeConfig {
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
        match fs::read_to_string("theme/config.json") {
            Ok(file_contents) => serde_json::from_str::<Self>(&file_contents)
                .expect("failed to parse theme/config.json"),
            _ => Self::default(),
        }
    }
}
