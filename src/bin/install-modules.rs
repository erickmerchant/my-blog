use std::{fs, path::Path};
use url::Url;

struct Dependency {
  name: String,
  version: String,
  file: String,
}

fn main() {
  let domain = "https://cdn.skypack.dev";
  let deps = [Dependency {
    name: String::from("@hyper-views/framework"),
    version: String::from("v2"),
    file: String::from("main.js"),
  }];

  fs::remove_dir_all("modules").ok();

  for dep in &deps {
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
    let full_destination = Path::new("modules").join(&dep.name).join(&dep.file);

    fs::create_dir_all(full_destination.parent().unwrap()).unwrap();

    fs::write(full_destination, body).unwrap();
  }
}
