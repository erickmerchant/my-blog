use clap::Parser;

#[derive(Parser, Debug, Clone)]
#[command(author, version, about, long_about = None)]
pub struct Args {
	#[arg(long, default_value_t = 8080)]
	pub listen: u16,
	#[arg(long)]
	pub no_cache: bool,
}
