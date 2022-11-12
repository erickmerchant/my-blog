use serde::Deserialize;

#[derive(Deserialize, Debug, Default, Clone)]
pub struct Config {
    #[serde(default)]
    pub source_maps: bool,
    #[serde(default = "default_port")]
    pub port: u16,
    #[serde(default = "default_targets")]
    pub targets: String,
}

fn default_port() -> u16 {
    8080
}

fn default_targets() -> String {
    String::from("supports es6-module and last 2 versions")
}
