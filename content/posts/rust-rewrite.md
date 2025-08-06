+++
title = "Rust rewrite"
datePublished = "2022-03-07"
+++

## Why Rust

Recently I rebuilt this site to use [Rust](https://www.rust-lang.org/) on the
server side, because I'm really into Rust now. There are great things about Rust
— safety, expressiveness, versatility, etc. — that others can explain better
than me, but I started learning it in 2020, because I initially wanted to use
WebAssembly, so Rust was a natural choice. I ended up not doing too much with
Web Assembly, but by 2021 I was having frequent fun with Rust. I loved
programming in it.

## Actix

To build this current iteration of the site, I compared as many web frameworks
as I could find, and ultimately chose [Actix](https://actix.rs/). Apart from its
middleware which is a little beyond my current understanding, Actix's API is
discoverable and easy to learn. The best place to look for help has been their
examples repo. They also have a Discord.

## Cargo dependencies

Some of the more important Cargo dependencies that I'm using, besides Actix:

### [Askama](https://github.com/djc/askama)

For Jinja-like templates. The only downside to Askama for me is that changing a
template means recompiling the project, but it's a tradeoff. The advantage is
that I never wonder whether I'm using something undefined in my templates.

### [SWC](https://swc.rs/)

For compiling JavaScript. It's basically a Rust Babel. It does aim to be many
other things as well, but I'm just using it to compile some JavaScript. It's
great.

### [Parcel CSS](https://parceljs.org/blog/parcel-css/)

For compiling CSS. It's basically like Postcss in Rust. It was actually released
when I had most of the server written already. Originally I was using a Sass
implementation in Rust, but I had forgotten how sometimes Sass syntax conflicts
with vanilla CSS, so I welcomed Parcel's arrival. It allows me to do nesting and
forget about prefixes. The only downside here is its alpha, so it sometimes
breaks. Committing my lock file has been a life saver.

Note: Parcel CSS is now [Lightning CSS](https://lightningcss.dev/).

## More to come

Any how there is more I could write about this rewrite, and I will certainly be
writing more about Rust in the future.
