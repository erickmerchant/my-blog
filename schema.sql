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
