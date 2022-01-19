use std::{convert::AsRef, fs, path::Path};
use url::Url;

struct Dependency<S: AsRef<str>> {
  name: S,
  version: S,
  file: S,
}

fn main() {
  let domain = "https://cdn.skypack.dev";
  let deps = [Dependency {
    name: "@hyper-views/framework",
    version: "v3",
    file: "main.js",
  }];

  fs::remove_dir_all("vendor").ok();

  for dep in deps {
    let res = reqwest::blocking::get(
      format!("{}/{}@{}/{}", domain, dep.name, dep.version, dep.file).to_string(),
    )
    .expect("Failed to get from cdn.skypack.dev");
    let headers = res.headers();

    let res = reqwest::blocking::get(
      Url::parse(domain)
        .unwrap()
        .join(
          headers["x-import-url"]
            .to_str()
            .expect("Failed to read header x-import-url"),
        )
        .unwrap(),
    )
    .unwrap();

    let body = res.text().expect("Empty body");
    let full_destination = Path::new("vendor").join(dep.name).join(dep.file);

    fs::create_dir_all(full_destination.parent().unwrap()).unwrap();

    fs::write(full_destination, body).unwrap();
  }
}
