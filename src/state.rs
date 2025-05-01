use std::{env, str::FromStr};

#[derive(Clone)]
pub struct State {
	pub args: Args,
}

#[derive(Clone)]
pub struct Args {
	pub base_dir: String,
	pub port: u16,
}

impl State {
	pub fn from_env() -> Self {
		let base_dir: String = get_env("APP_BASE_DIR", ".".to_string());
		let port: u16 = get_env("APP_PORT", 8080);

		Self {
			args: Args { base_dir, port },
		}
	}

	pub fn from_args(args: Args) -> Self {
		Self { args }
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
