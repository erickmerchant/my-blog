use crate::models::{Page, Pagination};
use std::convert::AsRef;

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;

fn row_to_page(row: &rusqlite::Row<'_>) -> Result<Page, rusqlite::Error> {
    Ok(Page {
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

pub fn get_all_pages<S: AsRef<str>>(
    conn: Connection,
    category: S,
) -> Result<Vec<Page>, rusqlite::Error> {
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
    .query_map([category.as_ref()], row_to_page)
    .and_then(Iterator::collect)
}

pub fn get_page<S: AsRef<str>>(
    conn: Connection,
    category: S,
    slug: S,
) -> Result<Page, rusqlite::Error> {
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
    .query_row([category.as_ref(), slug.as_ref()], row_to_page)
}

pub fn get_pagination<S: AsRef<str>>(
    conn: Connection,
    category: S,
    slug: S,
) -> Result<Pagination, rusqlite::Error> {
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
        .query_row([category.as_ref(), slug.as_ref()], row_to_page)
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
        .query_row([category.as_ref(), slug.as_ref()], row_to_page)
    {
        Some(previous)
    } else {
        None
    };

    Ok(Pagination { next, previous })
}
