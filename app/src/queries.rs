use schema::Page;
use std::convert::AsRef;

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;

pub fn get_all_posts(conn: Connection) -> Result<Vec<Page>, rusqlite::Error> {
    conn.prepare("SELECT slug, category, title, date, description, content, template FROM page WHERE category = ?1")?.query_map(["posts"], |row| {
       Ok(Page {
           slug: row.get(0)?, category: row.get(1)?, title: row.get(2)?, date: row.get(3)?, description: row.get(4)?, content: row.get(5)?, template: row.get(6)?
       })
   })
   .and_then(Iterator::collect)
}

pub fn get_post<S: AsRef<str>>(conn: Connection, slug: S) -> Result<Page, rusqlite::Error> {
    conn.prepare("SELECT slug, category, title, date, description, content, template FROM page WHERE category = ?1 AND slug = ?2")?.query_row([slug.as_ref(), "posts"], |row| {
       Ok(Page {
           slug: row.get(0)?, category: row.get(1)?, title: row.get(2)?, date: row.get(3)?, description: row.get(4)?, content: row.get(5)?, template: row.get(6)?
       })
   })
}
