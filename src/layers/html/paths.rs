use super::rewriter::Rewriter;
use camino::Utf8Path;
use std::fs;

impl Rewriter {
	pub fn get_dist_path(&self, path: &str) -> String {
		self.get_dist_directory() + "/" + path.trim_start_matches("/")
	}

	pub fn get_dist_directory(&self) -> String {
		self.base_dir.trim_end_matches("/").to_string() + "/dist"
	}

	pub fn get_full_path(&self, path: &str, with_hash: bool) -> String {
		if path.starts_with("./") || path.starts_with("../") || path.starts_with("/") {
			if let Ok(url) = self.url.join(path) {
				let url_path = url.path();
				let dist_path = self.get_dist_path(url_path);

				if with_hash {
					if let Ok(body) = fs::read_to_string(dist_path.as_str()) {
						let hash = md5::compute(body.as_bytes());
						let mut new_ext = format!("{hash:?}")[0..10].to_string();
						let path = Utf8Path::new(url_path);

						if let Some(ext) = path.extension() {
							new_ext = new_ext + "." + ext;
						}

						let path = path.with_extension(new_ext);

						return path.to_string();
					}
				}

				return url_path.to_string();
			};
		};

		path.to_string()
	}
}
