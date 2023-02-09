pub mod page;
pub mod pagination;

pub use page::*;
pub use pagination::*;

use std::convert::AsRef;

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;

impl Page {
    pub fn get_all<S: AsRef<str>>(
        conn: Connection,
        category: S,
    ) -> Result<Vec<Self>, rusqlite::Error> {
        conn.prepare(
            "SELECT
                slug,
                category,
                title,
                date,
                description,
                content,
                template,
                components
            FROM page
            WHERE category = ?1
            ORDER BY date DESC",
        )?
        .query_map([category.as_ref()], Page::map_row)
        .and_then(Iterator::collect)
    }

    pub fn get<S: AsRef<str>>(
        conn: Connection,
        category: S,
        slug: S,
    ) -> Result<Self, rusqlite::Error> {
        conn.prepare(
            "SELECT
                slug,
                category,
                title,
                date,
                description,
                content,
                template,
                components
            FROM page
            WHERE category = ?1 AND slug = ?2
            LIMIT 1",
        )?
        .query_row([category.as_ref(), slug.as_ref()], Page::map_row)
    }

    fn map_row(row: &rusqlite::Row<'_>) -> Result<Self, rusqlite::Error> {
        Ok(Self {
            slug: row.get(0)?,
            category: row.get(1)?,
            title: row.get(2)?,
            date: row.get(3)?,
            description: row.get(4)?,
            content: row.get(5)?,
            template: row.get(6)?,
            components: row
                .get::<usize, String>(7)?
                .split(',')
                .map(|s| s.to_string())
                .filter(|s| !s.is_empty())
                .collect(),
        })
    }
}

impl Pagination {
    pub fn get<S: AsRef<str>>(
        conn: Connection,
        category: S,
        slug: S,
    ) -> Result<Self, rusqlite::Error> {
        let next = if let Ok(next) = conn
            .prepare(
                "SELECT
                    slug,
                    category,
                    title,
                    date,
                    description,
                    content,
                    template,
                    components
                FROM page
                WHERE category = ?1 AND slug != ?2 AND date >= (
                    SELECT date FROM page WHERE category = ?1 AND slug = ?2 LIMIT 1
                )
                ORDER BY date ASC
                LIMIT 1",
            )?
            .query_row([category.as_ref(), slug.as_ref()], Page::map_row)
        {
            Some(next)
        } else {
            None
        };

        let previous = if let Ok(previous) = conn
            .prepare(
                "SELECT
                    slug,
                    category,
                    title,
                    date,
                    description,
                    content,
                    template,
                    components
                FROM page
                WHERE category = ?1 AND slug != ?2 AND date <= (
                    SELECT date FROM page WHERE category = ?1 AND slug = ?2 LIMIT 1
                )
                ORDER BY date DESC
                LIMIT 1",
            )?
            .query_row([category.as_ref(), slug.as_ref()], Page::map_row)
        {
            Some(previous)
        } else {
            None
        };

        Ok(Self { next, previous })
    }
}
