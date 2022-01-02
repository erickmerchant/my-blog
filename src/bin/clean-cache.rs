use std::fs;

fn main() {
  fs::remove_dir_all("storage/cache").ok();
}
