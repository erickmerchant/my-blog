mod migrations;

use anyhow::Result;
use app::{models::page, templates::get_env};
use glob::glob;
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use migrations::{Migrator, MigratorTrait};
use minijinja::context;
use pathdiff::diff_paths;
use sea_orm::{ActiveModelTrait, ActiveValue::Set, Database};
use std::{collections::HashSet, fs};
use syntect::{
    html::ClassStyle, html::ClassedHTMLGenerator, parsing::SyntaxSet, util::LinesWithEndings,
};

fn page_from_html(category: String, slug: String, contents: &str) -> Result<page::ActiveModel> {
    let mut data = page::ActiveModel {
        ..Default::default()
    };
    let mut elements = HashSet::<String>::new();
    let template_env = get_env();
    let ss = SyntaxSet::load_defaults_newlines();
    let mut output = vec![];
    let language_buffer = std::rc::Rc::new(std::cell::RefCell::new(String::new()));

    let mut rewriter = HtmlRewriter::new(
        Settings {
            element_content_handlers: vec![
                element!("front-json", |el| {
                    el.remove();

                    Ok(())
                }),
                text!("front-json", |el| {
                    if let Ok(d) = serde_json::from_str::<serde_json::Value>(el.as_str()) {
                        data.set_from_json(d)?;
                    }

                    Ok(())
                }),
                element!("code-block[language]", |el| {
                    if let Some(language) = el.get_attribute("language") {
                        language_buffer.borrow_mut().push_str(&language);
                    }

                    el.remove_and_keep_content();

                    Ok(())
                }),
                text!("code-block[language]", |el| {
                    let mut language = language_buffer.borrow_mut();

                    if let Some(syntax) = ss.find_syntax_by_extension(&language) {
                        let original_html = String::from(el.as_str());
                        let mut html_generator = ClassedHTMLGenerator::new_with_class_style(
                            syntax,
                            &ss,
                            ClassStyle::Spaced,
                        );

                        for line in LinesWithEndings::from(&original_html) {
                            html_generator.parse_html_for_line_which_includes_newline(line)?;
                        }

                        let highlighted_code = html_generator.finalize();
                        let ctx = context! {
                            language => language.clone(),
                            highlighted_code => highlighted_code,
                            inner_html => format!("<pre><code>{original_html}</code></pre>")
                        };
                        let template = template_env.get_template("elements/code-block.jinja")?;
                        let replacement_html = template.render(ctx)?;

                        el.replace(replacement_html.as_str(), ContentType::Html);

                        elements.insert("code-block".to_string());
                    }

                    language.clear();

                    Ok(())
                }),
            ],
            ..Default::default()
        },
        |c: &[u8]| output.extend_from_slice(c),
    );

    rewriter.write(contents.as_bytes())?;
    rewriter.end()?;

    data.content = Set(String::from_utf8(output)?);
    data.elements = Set(elements.into_iter().collect::<Vec<String>>().join(","));
    data.slug = Set(slug);
    data.category = Set(category);

    if data.title.is_not_set() {
        data.title = Set("Untitled".to_string());
    }

    if data.description.is_not_set() {
        data.description = Set("".to_string());
    }

    if data.date.is_not_set() {
        data.date = Set("0000-00-00".to_string());
    }

    if data.template.is_not_set() {
        data.template = Set("layouts/post.jinja".to_string());
    }

    Ok(data)
}

#[async_std::main]
async fn main() -> Result<()> {
    fs::remove_dir_all("storage").ok();
    fs::create_dir_all("storage")?;

    let conn = Database::connect("sqlite://./storage/content.db?mode=rwc")
        .await
        .unwrap();
    Migrator::up(&conn, None).await.unwrap();

    if let Ok(paths) = glob("content/**/*.html") {
        for path in paths.flatten() {
            let slug = format!("{}", path.file_stem().unwrap_or_default().to_string_lossy());
            let mut category = "".to_string();

            if let Some(p) = diff_paths(&path, "content") {
                if let Some(parent) = p.parent() {
                    category = format!("{}", parent.to_string_lossy());
                }
            };

            if let Ok(contents) = fs::read_to_string(&path) {
                let data = page_from_html(category, slug, &contents)?;

                data.insert(&conn).await?;
            }
        }
    };

    Ok(())
}
