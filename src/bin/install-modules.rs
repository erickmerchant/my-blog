use std::fs;
use std::path::Path;
use url::Url;

fn main() {
  let domain = "https://cdn.skypack.dev";
  let deps = ["@hyper-views/framework/main.js"];

  fs::remove_dir_all("storage/modules").ok();

  for dep in &deps {
    let res = reqwest::blocking::get(format!("{}/{}?min", domain, dep).to_string())
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
        .unwrap()
        .as_str(),
    )
    .unwrap();

    let body = res.text().expect("Empty body");
    let full_destination = Path::new("storage/modules").join(dep);

    fs::create_dir_all(full_destination.parent().unwrap()).unwrap();

    fs::write(full_destination, body).unwrap();
  }
}
