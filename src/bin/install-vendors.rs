use std::{convert::AsRef, fs, path::Path};

struct Dependency<S: AsRef<str>> {
  name: S,
  version: S,
  file: S,
}

fn main() {
  let domain = "https://unpkg.com";
  let deps = [Dependency {
    name: "@hyper-views/dom",
    version: "1",
    file: "main.js",
  }];

  fs::remove_dir_all("assets/vendor").ok();

  for dep in deps {
    let res = reqwest::blocking::get(
      format!("{}/{}@{}/{}", domain, dep.name, dep.version, dep.file).to_string(),
    )
    .expect("Failed to get from cdn.skypack.dev");

    let body = res.text().expect("Empty body");
    let full_destination = Path::new("assets/vendor").join(dep.name).join(dep.file);

    fs::create_dir_all(full_destination.parent().unwrap()).unwrap();

    fs::write(full_destination, body).unwrap();
  }
}
