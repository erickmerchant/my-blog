use std::fs;
use std::path::Path;

fn main() {
  let deps = [(
    "https://cdn.skypack.dev/@hyper-views/framework?min",
    "@hyper-views/framework/main.js",
  )];

  for (url, destination) in &deps {
    let res = reqwest::blocking::get(url.to_string()).unwrap();
    let headers = res.headers();

    let res = reqwest::blocking::get(format!(
      "https://cdn.skypack.dev/{}",
      headers["x-import-url"].to_str().unwrap()
    ))
    .unwrap();

    let body = res.text().unwrap();

    fs::create_dir_all(format!(
      "modules/{}",
      Path::new(destination).parent().unwrap().display()
    ))
    .unwrap();

    fs::write(format!("modules/{}", destination), body).unwrap();
  }
}
