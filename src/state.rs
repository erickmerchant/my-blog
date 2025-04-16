use crate::models::Model;
use std::{env, str::FromStr};

#[derive(Clone)]
pub struct State {
	pub args: Args,
	pub model: Model,
}

#[derive(Clone)]
pub struct Args {
	pub base_dir: String,
	pub rewrite_assets: bool,
	pub port: u16,
}

impl State {
	pub fn from_env() -> Self {
		let base_dir: String = get_env("APP_BASE_DIR", ".".to_string());
		let rewrite_assets: bool = get_env("APP_REWRITE_ASSETS", true);
		let port: u16 = get_env("APP_PORT", 8080);
		let model = Model::new(base_dir.to_owned());

		Self {
			args: Args {
				base_dir,
				rewrite_assets,
				port,
			},
			model,
		}
	}

	pub fn from_args(args: Args) -> Self {
		let model = Model::new(args.base_dir.to_owned());

		Self { args, model }
	}
}

fn get_env<T>(name: &str, default_value: T) -> T
where
	T: FromStr,
{
	if let Ok(Ok(p)) = env::var(name).map(|p| p.parse::<T>()) {
		p
	} else {
		default_value
	}
}
