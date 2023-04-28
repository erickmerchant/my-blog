use std::{fs, path::Path, path::PathBuf};

pub struct Cache {
    src: PathBuf,
}

impl Cache {
    pub fn new<P: AsRef<Path>>(file: &P) -> Self {
        Self {
            src: Path::new("storage/cache").join(file),
        }
    }

    pub fn read(&self) -> Option<String> {
        if envmnt::is("NO_CACHE") {
            None
        } else {
            fs::read_to_string(&self.src).ok()
        }
    }

    pub fn write(&self, code: &str) {
        if let Some(parent) = self.src.parent() {
            fs::create_dir_all(parent).ok();
            fs::write(&self.src, code).ok();
        }
    }
}
