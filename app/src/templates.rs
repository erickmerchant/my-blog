use crate::routes::compile_css;
use minify_html::{minify, Cfg};
use minijinja::{Environment, Error, ErrorKind, Source};
use std::path::Path;

pub fn get_env() -> Environment<'static> {
    let mut template_env = Environment::new();
    template_env.set_source(Source::from_path("templates"));

    template_env.add_filter("format_date", format_date);
    template_env.add_function("inline_css", inline_css);

    template_env
}

fn format_date(value: String, fmt: String) -> String {
    let mut ret = value.clone();

    if let Ok(parsed) = chrono::NaiveDate::parse_from_str(&value, "%Y-%m-%d") {
        ret = parsed.format(&fmt).to_string();
    }

    ret
}

fn inline_css(src: String) -> Result<String, Error> {
    let src = Path::new(&src);

    compile_css(src).map_err(|_e| Error::new(ErrorKind::InvalidOperation, "cannot load file"))
}

pub fn minify_html(code: String) -> String {
    let cfg = Cfg {
        minify_js: false,
        minify_css: false,
        ..Cfg::default()
    };

    let code_clone = code.as_bytes();

    let minified = minify(code_clone, &cfg);

    if let Ok(code) = String::from_utf8(minified) {
        code
    } else {
        code.clone()
    }
}
