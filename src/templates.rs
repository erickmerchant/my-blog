use horrorshow::helper::doctype;
use horrorshow::{html, Raw};

fn layout_template(main_html: String) -> String {
  (html! {
    : doctype::HTML;
    html(lang="en-US") {
      head {
        meta(charset="utf-8");
        meta(
          name="viewport",
          content="width=device-width, initial-scale=1"
        );
        meta(
          name="description",
          content="The personal site of Erick Merchant."
        );
        link(
          href="/static/favicon.svg",
          rel="icon",
          type="image/svg+xml"
        );
        title : "ErickMerchant.com";
        link(rel="stylesheet", href="/static/styles.css");
      }
      body {
        main {
          : Raw(&main_html)
        }
      }
    }
  })
  .to_string()
}

pub fn render_html(markdown: String) -> String {
  let mut content = String::new();
  let md_parser = pulldown_cmark::Parser::new_ext(&markdown, pulldown_cmark::Options::empty());
  pulldown_cmark::html::push_html(&mut content, md_parser);
  layout_template(content)
}

pub fn render_not_found_html() -> String {
  layout_template(
    (html! {
      h1: "Page Not Found";
      p: "That resource was moved, removed, or never existed.";
    })
    .to_string(),
  )
}
