+++
title = "Updated Cargo dependencies"
datePublished = "2023-05-06"
+++

A while back I wrote about rewriting this blog to use Rust. There have been a
lot of changes since then, and I wanted to catalog some the crates that I use
now, contrasting some with what I used initially.

## Changes

### [Axum](https://github.com/tokio-rs/axum)

I recently switched from Actix to Axum. Comparing the two I'd say that Actix has
better routing, but Axum has better middleware authoring and error handling.
Actix has a website, which I think is why I originally weighted it slightly
higher than Axum. With Axum you'll need to dig through examples in their repo
and github issues. Also they both have Discords, but Axum's is just a channel in
Tokio's Discord. Overall Axum I think has the better API, and I'm really happy
with how the migration from one to the other went.

### [Minijinja](https://github.com/mitsuhiko/minijinja)

I switched from Askama to Minijinja. Templating is probably the thing I've
changed the most. I've probably tried every decent option, and I determined that
Minijinja is the best, at least for me. It is nice, because it's made by the
person who made Jinja, so it's nearly identical. If you like Jinja, it's the
one.

## Additions

### [SeaORM](https://www.sea-ql.org/SeaORM/)

Years ago I had a static site generator called Wright written in PHP, that would
take static content like markdown files, load it into SQLite and then from there
generate a site. The advantage of static files is that you can easily edit them
and version control them. Putting content into a database though allows you to
query relationships in an efficient manner. Anyhow I'm doing that same thing
now, except the result is not a static site. I'm using SeaORM to interface with
SQLite. It's a really nice ORM, and I'm really happy with it.

### [LOL HTML](https://github.com/cloudflare/lol-html)

Before I throw my content into a DB, I do some preprocessing. LOL HTML is a tool
to rewrite HTML. I use it for instance to transform all code blocks to
highlighted code blocks. I'm also using it through Deno in
[Cool Style Server](https://github.com/erickmerchant/coolstyleserver), my hot
module reloading for CSS project.

## Subtractions

### [Lightning CSS](https://lightningcss.dev/)

Parcel CSS was renamed to Lightning CSS. Still amazing. I stopped preprocessing
my CSS though — largely because I stopped preprocessing my JS (see SWC below) —
so it's no longer in my project. The biggest loss here is minification. Turns
out Lighthouse doesn't care though. Nor my page speed.

### [SWC](https://swc.rs/)

I stopped using SWC for a few reasons. First there were roughly daily updates
with seemingly no changes. In node I would have called this package churn.
Second the current version only worked in nightly so I was locked into an older
version. This happened a few months back and I found an issue in GitHub where
the maintainer was like why can't you use nightly. For obvious reasons I don't
want to use nightly for my server. But to be clear I think it's entirely within
the maintainer's rights to decline to care about this. He writes it for free for
his needs mostly I imagine, leaving aside the Vercel connection. It's free after
all. Third I don't think I need it. The only thing I really lose is
minification.
