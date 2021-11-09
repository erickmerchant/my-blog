+++
title = "Isomorphic rendering with Rust"
slug = "isomorphic-rendering-with-rust"
date = 2021-10-28
+++

Recently I started learning [Rust](https://www.rust-lang.org/). Compared to other programming languages I have learned it has been slow going. I started to read the book several times, only to need to stop and come back later and reread chapters to really grasp them. The book is great though, and there are so many other excellent resources for learning. And while you can't jump ahead really, you can copy examples without fully understanding everything, and then go back later to understand what you have cobbled together. That's the stage that I'm at now.

As a person that's spent most of their career writing JavaScript I have wanted to learn something more "serious". I actually think JavaScript is great, but it is not all there is and certainly isn't perfect. Rust is the first strongly typed language I've used. The reason I chose Rust is it was really down to either Rust or Go, and Rust seemed to better support wasm, so Rust was the winner. Plus Ferris has got to be the best mascot.

# Pjax with WebAssembly

After doing the guessing game exercise in the book, I had this idea of seeing if I could make a website that was static, but then on the front end used fetch + wasm to render templates dynamically. If you remember [pjax](https://github.com/defunkt/jquery-pjax) my idea was basically pjax but with wasm. A sort of isomorphic rendering with Rust.

What immediately interested me in Rust is just modeling data, because it's a way to learn it's data types, and again it's the first strongly typed language I've worked with. I love enums, tuples, and structs. You can really express what something is with such building blocks. A static site would allow me to implement something I've done in other languages a million times, while using these building blocks I was learning.

So I started looking for crates I could utilize on [https://crates.io/](https://crates.io/). I ended up choosing [Askama](https://github.com/djc/askama), a Rust version of Jinja for templating. I love Jinja-like templates. Then [pulldown-cmark](https://github.com/raphlinus/pulldown-cmark), a markdown parser, and [TOML](https://github.com/toml-lang/toml), a configuration language used by [Cargo](https://doc.rust-lang.org/cargo/) that I thought would be good for front-matter. The main appeal of Toml for front-matter being that it has dates.

# The result

I've put what I ended up cobbling together up [on github](https://github.com/erickmerchant/rust-static-site), and you can see the result live [on netlify](https://epic-wing-e31d6d.netlify.app/). A couple of highlights of this technique are that the same templates are used on the front end and back end. On the front end markdown is fetched to get the data for the requested page. You could certainly transform that though to JSON and that would possibly reduce the size of the wasm file generated. And that brings me to the final thing I'd point out. The wasm file is 167kb compressed. That's a lot, but again there is a markdown parser and templates in there, so maybe it's not that much really. Also wasm code will run faster than js. I think ultimately it's a viable way to make a website. I won't be rewriting anything to use this technique anytime soon, but on the other hand I think it points out how powerful Rust on the front end can be.

I've linked to the repo and result, but what kind of blog post would this be without at least a few snippets of code.

This is my template.

```jinja
{# I use is_xhr to include the shell of the page or not. When the html is statically rendered it's true, but on the front end it's  set to false, because I'm just replacing the main element. #}
{% if is_xhr %}
  {% block main %}{% endblock %}
{% else %}
<!DOCTYPE html>
<html>
  <head>
    <title>...</title>
    <style>
      ...
    </style>
    <script type="module">
      ...
    </script>
  </head>
  <body>
    <nav>
      ...
    </nav>
    <main>{% block main %}{% endblock %}</main>
  </body>
</html>
{% endif %}
```

And here is probably the most interesting code, where I define all the templates and filters.

```rust
use askama::Template;
use serde::Deserialize;
use std::process;
use std::str::FromStr;
use toml::value::Datetime;

mod filters {
    use askama::Result;
    use chrono::NaiveDate;
    use pulldown_cmark::{html, Options, Parser};
    use toml::value::Datetime;
    pub fn markdown(s: &str) -> Result<String> {
        let mut content = String::new();
        let md_parser = Parser::new_ext(&s, Options::empty());
        html::push_html(&mut content, md_parser);
        Ok(content)
    }
    pub fn date(d: &Datetime, f: &str) -> Result<String> {
        match NaiveDate::parse_from_str(d.to_string().as_str(), "%Y-%m-%d") {
            Ok(date) => {
                let formatted = date.format(f).to_string();
                Ok(formatted)
            }
            _ => Ok(d.to_string()),
        }
    }
}

#[derive(Deserialize)]
pub struct PostData {
    title: String,
    date: Datetime,
    tags: Vec<String>,
    image: String,
}

#[derive(Template, Deserialize)]
#[template(path = "page.html")]
pub struct PostTemplate {
    pub data: PostData,
    pub content: String,
    pub is_xhr: bool,
}

#[derive(Deserialize)]
pub struct ErrorData {
    pub title: String,
}

#[derive(Template, Deserialize)]
#[template(path = "error.html")]
pub struct ErrorTemplate {
    pub data: ErrorData,
    pub content: String,
    pub is_xhr: bool,
}

impl ErrorTemplate {
    pub fn error_404() -> ErrorTemplate {
        ErrorTemplate {
            data: ErrorData {
                title: String::from("Page not found"),
            },
            content: String::from("Try the [home page](/)"),
            is_xhr: true,
        }
    }
}

impl Default for PostData {
    fn default() -> PostData {
        PostData {
            title: String::new(),
            date: match Datetime::from_str("0000-00-00") {
                Ok(date) => date,
                _ => process::abort(),
            },
            image: String::new(),
            tags: vec![],
        }
    }
}
```

I'd also check out [Yew](https://yew.rs/) if using Rust on the front end interests you.
