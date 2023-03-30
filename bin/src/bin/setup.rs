use anyhow::Result;
use app::{models::Page, templates::get_env};
use glob::glob;
use lol_html::{element, html_content::ContentType, text, HtmlRewriter, Settings};
use minijinja::context;
use pathdiff::diff_paths;
use rusqlite::Connection;
use std::{collections::HashSet, fs};
use syntect::{
    html::ClassStyle, html::ClassedHTMLGenerator, parsing::SyntaxSet, util::LinesWithEndings,
};

fn page_from_html(category: String, slug: String, contents: &str) -> Result<Page> {
    let mut data = Page::default();
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
                    if let Ok(d) = serde_json::from_str::<Page>(el.as_str()) {
                        data = d;
                    }

                    Ok(())
                }),
                element!("code-block[language]", |el| {
                    if let Some(language) = el.get_attribute("language") {
                        language_buffer.borrow_mut().push_str(&language);
                    }

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

                        let html = html_generator.finalize();
                        let ctx = context! {
                            html => html
                        };
                        let template = template_env.get_template("elements/code-block.jinja")?;
                        let replacement_html = template.render(ctx)?;

                        let replacement_html =
                            format!("{replacement_html}<pre><code>{original_html}</code></pre>");

                        el.replace(replacement_html.as_str(), ContentType::Html);

                        elements.insert("code-block".to_string());
                    }

                    language.clear();

                    Ok(())
                }),
            ],
            ..Settings::default()
        },
        |c: &[u8]| output.extend_from_slice(c),
    );

    rewriter.write(contents.as_bytes())?;
    rewriter.end()?;

    data.content = String::from_utf8(output)?;
    data.elements = elements.into_iter().collect::<Vec<String>>().join(",");
    data.slug = slug;
    data.category = category;

    Ok(data)
}

fn main() -> Result<()> {
    fs::create_dir_all("storage")?;

    let conn = Connection::open("storage/content.db")?;

    conn.execute_batch(
        "
        DROP TABLE IF EXISTS page;
        CREATE TABLE page (
             id INTEGER PRIMARY KEY,
             slug TEXT NOT NULL,
             category TEXT NOT NULL,
             title TEXT NOT NULL,
             date TEXT NOT NULL,
             description TEXT NOT NULL,
             content TEXT NOT NULL,
             template TEXT NOT NULL,
             elements TEXT NOT NULL
         );
         CREATE UNIQUE INDEX unique_category_slug ON page (category, slug);
        ",
    )?;

    let mut insert_page_stmt = conn.prepare(
        "INSERT INTO page (
                slug,
                category,
                title,
                date,
                description,
                content,
                template,
                elements
            )
            VALUES ( ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8 )",
    )?;

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

                insert_page_stmt.execute([
                    data.slug,
                    data.category,
                    data.title,
                    data.date,
                    data.description,
                    data.content,
                    data.template,
                    data.elements,
                ])?;
            }
        }
    };

    Ok(())
}
