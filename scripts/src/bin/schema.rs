use glob::glob;
use pathdiff::diff_paths;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
pub struct FrontMatter {
    #[serde(default)]
    pub title: String,
    #[serde(default = "default_date")]
    pub date: String,
    #[serde(default)]
    pub description: String,
    #[serde(default = "default_template")]
    pub template: String,
}

fn default_date() -> String {
    "0000-00-00".to_string()
}

fn default_template() -> String {
    "post.jinja".to_string()
}

fn main() {
    let conn = Connection::open("storage/content.db").unwrap();

    conn.execute(r#"drop table if exists "page""#, []).unwrap();

    conn.execute(
        r#"create table if not exists "page" (
             "id" integer primary key,
             "slug" text not null,
             "category" text not null,
             "title" text not null,
             "date" text not null,
             "description" text not null,
             "content" text not null,
             "template" text not null
         )"#,
        [],
    )
    .unwrap();

    let mut insert_stmt = conn
        .prepare(
            r#"insert into "page" (
                "slug",
                "category",
                "title",
                "date",
                "description",
                "content",
                "template"
            )
            values ( ?1, ?2, ?3, ?4, ?5, ?6, ?7 )"#,
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
                let mut data = FrontMatter::default();
                let mut content = "".to_string();

                if contents.starts_with("{\n") {
                    if let Some((above, below)) = contents.split_once("}\n") {
                        if let Ok(frontmatter) =
                            serde_json::from_str::<FrontMatter>(format!("{above}}}").as_str())
                        {
                            data = frontmatter;

                            content = below.to_string();
                        }
                    }
                }

                insert_stmt
                    .execute([
                        slug,
                        category,
                        data.title,
                        data.date,
                        data.description,
                        content,
                        data.template,
                    ])
                    .unwrap();
            }
        }
    }
}
