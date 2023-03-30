CREATE TABLE IF NOT EXISTS "seaql_migrations" (
  "version" text NOT NULL PRIMARY KEY,
  "applied_at" integer NOT NULL
);

CREATE TABLE sqlite_sequence(name, seq);

CREATE TABLE IF NOT EXISTS "page" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "category" text NOT NULL,
  "date" text NOT NULL,
  "description" text NOT NULL,
  "content" text NOT NULL,
  "template" text NOT NULL,
  "elements" text NOT NULL
);
