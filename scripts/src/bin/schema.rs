use glob::glob;

fn main() {
    if let Some(files) = glob("./content/**/*.html").ok() {
        for file in files.flatten() {
            println!("{file:?}");
        }
    }
}
