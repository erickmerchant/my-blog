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
