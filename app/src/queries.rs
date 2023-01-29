use schema::Page;
use std::convert::AsRef;

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;

pub fn get_all_pages<S: AsRef<str>>(
    conn: Connection,
    category: S,
) -> Result<Vec<Page>, rusqlite::Error> {
    conn.prepare("SELECT slug, category, title, date, description, content, template FROM page WHERE category = ?1")?.query_map([category.as_ref()], |row| {
       Ok(Page {
           slug: row.get(0)?, category: row.get(1)?, title: row.get(2)?, date: row.get(3)?, description: row.get(4)?, content: row.get(5)?, template: row.get(6)?
       })
   })
   .and_then(Iterator::collect)
}

pub fn get_page<S: AsRef<str>>(
    conn: Connection,
    category: S,
    slug: S,
) -> Result<Page, rusqlite::Error> {
    conn.prepare("SELECT slug, category, title, date, description, content, template FROM page WHERE category = ?1 AND slug = ?2")?.query_row([category.as_ref(), slug.as_ref()], |row| {
       Ok(Page {
           slug: row.get(0)?, category: row.get(1)?, title: row.get(2)?, date: row.get(3)?, description: row.get(4)?, content: row.get(5)?, template: row.get(6)?
       })
   })
}
