use glob::glob;
use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::{fs, vec::Vec};

#[derive(Deserialize, Debug, Clone, Default, Serialize)]
pub struct FrontMatter {
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub slug: String,
    #[serde(default)]
    pub title: String,
    #[serde(default = "FrontMatter::default_date")]
    pub date: String,
    #[serde(default)]
    pub description: String,
    #[serde(default = "FrontMatter::default_template")]
    pub template: String,
}

impl FrontMatter {
    fn default_date() -> String {
        "0000-00-00".to_string()
    }

    fn default_template() -> String {
        "post.jinja".to_string()
    }
}

fn main() -> Result<()> {
    let conn = Connection::open("content.db")?;

    conn.execute(
        "create table if not exists page (
             id integer primary key,
             title text not null,
             date text not null,
             description text not null,
             template text not null,
         )",
        [],
    )?;

    let _insert_stmt = conn.prepare(
        "insert into page ( title, date, description, template )
            values ( ?1, ?2, ?3, ?4 )",
    )?;

    if let Ok(paths) = glob("content/**/*.html") {
        for path in paths.flatten() {
            if let Ok(contents) = fs::read_to_string(&path) {
                let mut data = FrontMatter::default();

                if contents.starts_with("{\n") {
                    if let Some((above, below)) = contents.split_once("}\n") {
                        if let Ok(frontmatter) =
                            serde_json::from_str::<FrontMatter>(format!("{above}}}").as_str())
                        {
                            data = frontmatter;

                            let _content = below.to_string();
                        }
                    }
                }

                println!("{data:?}");
            }
        }
    }

    Ok(())
}
