use std::fs;
use std::path::Path;
use url::Url;

fn main() {
  let deps = [(
    "https://cdn.skypack.dev/@hyper-views/framework?min",
    "@hyper-views/framework/main.js",
  )];

  for (url, destination) in &deps {
    let res = reqwest::blocking::get(url.to_string()).expect("skypack to respond");
    let headers = res.headers();

    let res = reqwest::blocking::get(
      Url::parse("https://cdn.skypack.dev")
        .unwrap()
        .join(
          headers["x-import-url"]
            .to_str()
            .expect("x-import-url header in the response"),
        )
        .unwrap()
        .as_str(),
    )
    .unwrap();

    let body = res.text().expect("body in the response");
    let full_destination = Path::new("modules").join(destination);

    fs::create_dir_all(full_destination.parent().unwrap()).unwrap();

    fs::write(full_destination, body).unwrap();
  }
}
