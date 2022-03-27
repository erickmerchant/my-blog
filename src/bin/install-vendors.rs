use actix_rt::System;
use awc::Client;
use std::{convert::AsRef, fs, path::Path};

struct Dependency<S: AsRef<str>> {
  name: S,
  version: S,
  file: S,
}

fn main() {
  System::new().block_on(async {
    let client = Client::default();
    let domain = "https://unpkg.com";
    let deps = [Dependency {
      name: "@hyper-views/dom",
      version: "1",
      file: "main.js",
    }];

    fs::remove_dir_all("assets/vendor").ok();

    for dep in deps {
      let destination = Path::new("assets/vendor").join(dep.name).join(dep.file);

      destination
        .parent()
        .map(|parent| fs::create_dir_all(parent))
        .map(|_| ())
        .expect("failed to create parent directory");

      let body = client
        .get(format!("{}/{}@{}/{}", domain, dep.name, dep.version, dep.file).to_string())
        .send()
        .await
        .expect("failed to respond")
        .body()
        .await
        .expect("failed to get body");

      fs::write(destination, body).expect("failed to write");
    }
  });
}
