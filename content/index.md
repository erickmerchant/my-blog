+++
title = "Hello world"
_template = "home.html"
+++

As I tend to do from time to time, I have rewritten this site recently in technologies that currently interest me. A quick summary is it's now written in Rust on the server side and uses web components on the client side.

## Why Rust?

I started learning Rust in 2020 as something to do. I had long wanted to learn a statically typed language, and also wanted to experiment with web assembly, so Rust ended up being at the top of my list of possible languages to learn. I didn't get far in 2020 with it. I read the book and reread it. Certain concepts took some time to grasp. Like a long time. Then I made some experimental sites with it. First a static site and then a dynamic one that used wasm to do a sort of pjax type thing, where markdown was fetched and rendered using a wasm build. Somewhere in 2021 I started to feel fairly comfortable doing certain things. I'm still very much a novice, and suspect I will be for another year at least, but I can make simple programs in it. After a year and some months of working with it, I am loving Rust. I feel like I get certain things about programming I just didn't know before, having spent my career writing JavaScript, and see the advantages of statically typed language now.

## Server requirements

So anyhow I decided to make my personal site a dynamic website for the first time probably since somewhere close to ten years. I had a few hard requirements for a new site, server-wise.

1. Local SSL
2. HTTP/2
3. Brotli compression

Actix was able to do all these. I've been lurking on their discord for a few months, and the community is helpful. I've been following the development of version 4 closely. Apart from middleware which is a little beyond my current understanding, Actix's api is really versatile and easy to learn. The best place to look has been their examples repo.

## Cargo dependencies.

Some of the more important Cargo dependencies that I have are:

1. Actix
2. Tera
3. SWC
4. Parcel CSS

Actix, I already mentioned, is the web framework that I chose. Tera is a jinja implementation essentially, a templating language. SWC is for transpiling JavaScript. And Parcel CSS is for transpiling CSS.

## Declarative shadow dom

## Not a blog.
