use glob::glob;
use models::Page;
use pathdiff::diff_paths;
use rusqlite::Connection;
use std::fs;

fn main() {
    fs::create_dir_all("storage").unwrap();

    let conn = Connection::open("storage/content.db").unwrap();

    conn.execute("DROP TABLE IF EXISTS page", []).unwrap();

    conn.execute(
        "CREATE TABLE IF NOT EXISTS page (
             id INTEGER PRIMARY KEY,
             slug TEXT NOT NULL,
             category TEXT NOT NULL,
             title TEXT NOT NULL,
             date TEXT NOT NULL,
             description TEXT NOT NULL,
             content TEXT NOT NULL,
             template TEXT NOT NULL
         );
         CREATE UNIQUE INDEX unique_category_slug ON page (category, slug);",
        [],
    )
    .unwrap();

    let mut insert_stmt = conn
        .prepare(
            "INSERT INTO page (
                slug,
                category,
                title,
                date,
                description,
                content,
                template
            )
            VALUES ( ?1, ?2, ?3, ?4, ?5, ?6, ?7 )",
        )
        .unwrap();

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
                let mut data = Page {
                    slug: slug.clone(),
                    category: category.clone(),
                    content: "".to_string(),
                    ..Page::default()
                };

                if contents.starts_with("{\n") {
                    if let Some((above, below)) = contents.split_once("}\n") {
                        if let Ok(frontmatter) =
                            serde_json::from_str::<Page>(format!("{above}}}").as_str())
                        {
                            data = frontmatter;

                            data.slug = slug;
                            data.category = category;
                            data.content = below.to_string();
                        }
                    }
                }

                insert_stmt
                    .execute([
                        data.slug,
                        data.category,
                        data.title,
                        data.date,
                        data.description,
                        data.content,
                        data.template,
                    ])
                    .unwrap();
            }
        }
    }
}
