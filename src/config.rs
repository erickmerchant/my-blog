use clap::Parser;

#[derive(Parser, Debug, Clone)]
#[command(version, long_about = None)]
pub struct Config {
    #[arg(long, default_value_t = false)]
    pub source_maps: bool,

    #[arg(long, default_value_t = 8080)]
    pub port: u16,

    #[arg(long, default_value_t = Config::get_default_targets())]
    pub targets: String,
}

impl Config {
    pub fn get_default_targets() -> String {
        "supports es6-module and last 2 versions".to_string()
    }
}
