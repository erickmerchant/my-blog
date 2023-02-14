use minify_html::{minify, Cfg};
use minijinja::{Environment, Source};

pub fn get_env() -> Environment<'static> {
    let mut template_env = Environment::new();
    template_env.set_source(Source::from_path("theme"));

    template_env.add_filter("date", date);

    template_env
}

fn date(value: String, fmt: String) -> String {
    let mut ret = value.clone();

    if let Ok(parsed) = chrono::NaiveDate::parse_from_str(&value, "%Y-%m-%d") {
        ret = parsed.format(&fmt).to_string();
    }

    ret
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
