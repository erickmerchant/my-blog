use std::fs;
use std::path::Path;
use url::Url;

fn main() {
  let deps = [(
    "https://cdn.skypack.dev/@hyper-views/framework?min",
    "@hyper-views/framework/main.js",
  )];

  for (url, destination) in &deps {
    let res = reqwest::blocking::get(url.to_string()).expect("Failed to get from cdn.skypack.dev");
    let headers = res.headers();

    let res = reqwest::blocking::get(
      Url::parse("https://cdn.skypack.dev")
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
    let full_destination = Path::new("modules").join(destination);

    fs::create_dir_all(full_destination.parent().unwrap()).unwrap();

    fs::write(full_destination, body).unwrap();
  }
}
