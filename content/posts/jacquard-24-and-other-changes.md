+++
title = "Jacquard 24 and other changes"
datePublished = "2025-05-18"
+++

This is a big sprawling stream of thought recounting of a big redesign of this
blog's architecture, and a bit of a redesign of its look. If you like that sort
of thing then read on. I just feel like saying that up front, because it's hard
to get a sense of where this will go from the first paragraphs.

A few weeks back I started looking at [Lume](https://lume.land/) to start a new
site, a memorial for my dog Ellie who passed away last November. I still haven't
gotten to that site, but what followed was a pivoting of this site from a
[Rust](https://www.rust-lang.org/) server using
[Axum](https://github.com/tokio-rs/axum) as a framework,
[Askama](https://github.com/askama-rs/askama) for templating, and basically just
nothing for assets, to writing a full-on build step in
[Deno](https://deno.com/). I still have the Rust server, but now it just serves
static files.

I will get to the memorial site, but it was actually important to find a system
for making sites that I could use for it since it's the sort of project where I
really want to focus on the design and content and not spend time futzing around
with middleware or plugins or whatever.

Through out my career I feel like I've had two systems — or maybe stacks would
be a better term — for making sites. First there was [PHP](https://www.php.net/)
and [jQuery](https://jquery.com/) or as I actually preferred for a long time
[Ender](https://github.com/ender-js/Ender). And I preferred
[Slim](https://www.slimframework.com/) by the way in terms of PHP frameworks.
And then I used my own framework that was called
[hyper-views](https://github.com/hyper-views/framework) and was a html tagged
template literal type framework essentially with which I mostly wrote isomorphic
static sites. Then around 2019 as I've written before, I'm sure, I started
experimenting with Rust, got sick of NPM altogether due to the security issues
and started making sites with [Actix](https://actix.rs/) and later Axum. I love
Rust, but lately I've felt that while I could do anything and everything in
Rust, I don't. Essentially I use to make lots of sites, experiment with things,
and largely I just don't do that anymore in the same way. I want something that
makes me productive again. If I have an idea I want to build it. And I have this
philosophy or maybe ethos now that it's good to have a scripting language and a
compiled language that you reach for. There are strengths to both, and it's wise
to know when to use the right one.

So why not Lume? Well Lume is cool, but since I tried to migrate my blog to it
first — to again find a system or new stack — I found rough edges. It's cool,
but wasn't right for me. At the same time I've never really used Deno except for
little CLIs like a
[wordle solver](https://gist.github.com/erickmerchant/2660bf9e7459fad7033750d33d05da92)
or [murdle solver](https://github.com/erickmerchant/murdle-solver). And I loved
Deno, so it just seemed like I wanted to write a bespoke program instead of
using something off the shelf anyhow.

And at the same time as all this sort of quest for a stack stuff I have a new
frontend framework that I'm actively using on static one pages and codepens,
called [Handcraft](https://github.com/erickmerchant/handcraft). It then seemed
natural that I'd try to use that for templating instead of say Preact with JSX.

What I wrote is not a static site generator, but will probably end up being a
CLI published to JSR that I can use across projects. What follows are some
highlights of this new stack, and also some design work, random tangents, and
changes to Handcraft too.

## Typescript

The build step is written in Typescript. This is the largest program I've made
in Typescript where I wasn't getting paid. There are two reasons this is
important. First, I always feel like I learn the most using technologies for my
personal projects. Without project managers and team leads I'm able to truly
make things perfect and do things 100% right. I guess this is about having no
deadline, but also has to do with owning the whole thing. On projects for
companies I've never really been in total control. Second, again I have to bring
up Rust. While I love it, the chances of me getting a job doing it seem small.
It seems like most work is computer-sciency type stuff that doesn't make my
chances great. I find Typescript to be a bit disappointing. It's just not strict
enough for my taste and seems to conflict with JS often, but I'm much much more
likely to get a job doing it. Honestly I probably should have shifted from Rust
to Typescript a year ago for this reason, but it's hard to shift language usage.
Rust is really that great. And also again I am still going to write Rust, but
for different problems. For instance I plan to revive my
[dedupe.css](https://github.com/hyper-views/dedupe.css) project at some point
and build it on top of Lightning CSS in Rust.

I say largely written in Typescript because anywhere I interact with Handcraft
it's actually JS. I've found Handcraft to be impossible to type. Its use of
proxies for one thing make it very difficult.

## SWC and Lightning CSS

Working in Typescript with access to NPM and JSR modules makes transpiling
assets easy again. While [SWC](https://swc.rs/) and
[Lightning](https://lightningcss.dev/) are both Rust projects, their main
interface is through JS or a CLI. And let me tell you it's way way easier. Now
transpiling JS is trivial. I did it in Rust for a bit, but the code was very
complicated and disappointing. Now writing code that say finds all modules and
recursively builds a dependency graph is trivial. Same goes for CSS and
Lightning. Now I'm minifying assets again too.

It's all part of getting that perfect performance that I'm driven to attain. You
know it's funny. I'm naturally not competitive person. I've never cared about
sports or games much except that one time I worked night and day to get golden
paladin in Hearthstone. But with web performance I've obsessed with winning.

## PrismJS

I decided I needed code highlighting again, and chose
[Prism](https://prismjs.com/) for this. It's not the new shiny syntax
highlighter, but I've used it for years, and the languages it supports are
sufficient. I'm doing this in the build step, so no JS is shipped for it, which
allows the list of languages to be limited only by what Prism supports or I can
add myself.

This isn't terribly interesting except that the way I've decided to customize
one of the default themes is with this named color + relative color syntax
technique I'm fond of now. There are over 150 named colors in CSS. Named colors
are great for prototyping I think, but if you try to use them in an actual
design you end up with a confusing mess of saturations etc. This technique
addresses this by starting with a base named color you pick and then applying a
uniform chroma and/or lightness (if you use oklch), or a uniform saturation
and/or lightness (if you use hsl). Say you like tomato for that alert you've
crafted but it clashes with the plum you have for your logo. You'd do something
like `oklch(from tomato var(--shared-lightness) c h)`. I made a codepen related
to this technique you can
[check out](https://codepen.io/erickmerchant/pen/jEORGxx).

## Jacquard 24 and other fonts

I've decided to use fonts again. I know, my site was fairly austere before this.
The truth is that I was basically not using fonts because I wanted to make my
site as tiny as possible. Well no more, but as I said about performance is still
an obsession of mine and caching and preloading I talk about below help to
offset the insane weight of fonts.

I'm using Work Sans as the main font and Fira Code for code. Both are subset
with pyftsubset by running a bash function I have in my `.zshrc`

```bash
subset_latin_woff2 () {
	pyftsubset $1 --output-file=$(basename $1 '.ttf')-subset.woff2 --unicodes=U+20-7E --flavor=woff2 --layout-features='wght';
}
```

I'm also using something called Jacquard 24 for my banner or site title. I had
recently learned about my home town's newspaper
[shutting down](https://en.wikipedia.org/wiki/Cortland_Standard) due to tariffs
but then has since been purchased, and I was thinking about
[its title](https://www.cortlandstandard.com/). I'm not much of a font person,
so I can only describe the font they use as their title as old and newspapery.
Any how I had this idea that I wanted something like that. What I found is
[Jacquard](https://fonts.google.com/specimen/Jacquard+24/about), named after a
type of fabric possibly. It's intended for textiles, but has this pixelated look
that I really like. For it I'm subsetting to only the the letters in my name
"EMacehiknrt".

## Caching, preloading, and inlining

I'm doing several things to ensure that my network graph remains as flat as
possible. All assets except favicons are requested as soon as is possible and in
the network panel there is hardly a waterfall at all.

I'm continuing to use the cache strategy described in a previous post,
["Super cache strategy"](/posts/super-cache-strategy/). So all assets are
prefixed with a unique hash so that they can be cached for a year while html
uses an etag approach.

Fonts are preloaded, using meta tags. All JS is preloaded using modulepreload
meta tags.

Import maps are rewritten so that they point to the files with hashes in their
names.

All CSS is inlined. This comes from the old recommendation from Google that you
"reduce the size of the above-the-fold content". I've done this off and on for
years, and it really does help make things very fast, though of course I'm
throwing away my caching strategy for css assets by doing this. I suppose that I
should really look at each html file and only do it if the result is less than
the "initial congestion window" of TCP. I may do that in the future.

## favicon-dark and favicon-light

I have a new favicon using an "E" in Jacquard. There is a dark one and light
one.

## Handcraft: proxies all the way down

So Handcraft ended up being great for templating. I'm using
[happy-dom](https://www.npmjs.com/package/happy-dom), to run views, but in the
future I'll have true server support in Handcraft that won't require a DOM.

However great, as I used it server-side, I found large templates really pushed
the limits on the fluent interface design though, and I found all the `attr` and
`append` calls to be noisy. So I developed an extension to the syntax. It's
still in beta as of this writing, but the result I believe is the way forward
and should be useful on server and client. The old syntax still works, but you'd
need to change some imports.

Previously you'd write something like this. The head of my blog, simplified, as
an example.

```javascript
head().append(
  meta().attr("charset", "utf-8"),
  meta()
    .attr("name", "viewport")
    .attr("content", "width=device-width, initial-scale=1"),
  title().text(site.title),
  link().attr("rel", "stylesheet").attr("href", "/page.css"),
  link()
    .attr("rel", "alternate")
    .attr("type", "application/rss+xml")
    .attr("title", "Posts")
    .attr("href", site.host + "/posts.rss"),
  meta().attr("name", "description").atrr("content", site.description),
);
```

Now it's the much more terse...

```javascript
head(
  meta.charset("utf-8"),
  meta.name("viewport").content("width=device-width, initial-scale=1"),
  title(site.title),
  link.rel("stylesheet").href("/page.css"),
  link
    .rel("alternate")
    .type("application/rss+xml")
    .title("Posts")
    .href(site.host + "/posts.rss"),
  meta.name("description").content(site.description),
);
```

Tricks with proxies are involved as usual.

## RFC 822, en-NZ, and Intl.DateTimeFormat

A bit of a tangent, but while I was converting my Rust + Askama (Rust Jinja
basically) views to Javascript + Handcraft I wanted to use standard JS code to
format dates. Well actually I couldn't find a suitable module, so I tried to use
[Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal).
This worked great, but RSS dates which need to be in the RFC-822 format were not
something I could get Temporal to do at first. I used code from this
[excellent blog post](https://whitep4nth3r.com/blog/how-to-format-dates-for-rss-feeds-rfc-822/).
That worked great, but I really wanted to use `Temporal`. Anyways I finally
found a way, and it involves using the `en-NZ` locale.

```javascript
/* https://whitep4nth3r.com/blog/how-to-format-dates-for-rss-feeds-rfc-822/ */
export function asRFC822Date(date: Temporal.PlainDate) {
	return (
		new Intl.DateTimeFormat("en-NZ", {
			weekday: "short",
			day: "2-digit",
			month: "short",
			year: "numeric",
			timeZone: "UTC",
		}).format(date) +
		" " +
		new Intl.DateTimeFormat("en-NZ", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hourCycle: "h24",
		}).format(new Temporal.PlainTime(0, 0, 0)) +
		" EST"
	);
}
```

Just replace "EST" with your timezone, and be sure to pass in a
`Temporal.PlainDate`.

## Replacing submodules with some shell commands

My `projects` folder in my `public` folder is no more. Git submodules were fine,
although I think over time I started to see why people don't use them much. But
since I'm essentially copying `public` to a `dist` directory and then
transforming files and adding new ones, I now can get rid of the submodules and
just clone embedded projects directly into the dist folder.

## Future of the Rust server

It would be tempting to just ditch the Rust server and go static, but I'm fairly
certain that I won't unless I need to move to a host that can't deploy docker.
Part of the reason I moved to a Rust server is I was not happy with static
hosting. The performance was just never great, and I could not make it better.
Having my own server means that I can make it better. Both in terms of the code,
and the resources I allocate to its deployment. The fact that it is just a
dedicated static server now only makes that all easier, and makes it faster as
well.

For my blog, this site though, I do want to be able to host statically if I need
to. We're in chaotic times, and I think a static site is a good way to weather
the storm. It's the easiest way to move a site with little warning.

I will likely make the Rust server a crate I can install, so I can use it on
other projects.

## But wheels

Yes, I know I'm reinventing wheels. I think it's fine. Problems have been
solved, true, but not in the best way perhaps for me. I also don't think
engineers at large tech companies can write the code I need better than I can, a
big reason I never use React unless I'm paid to. I have dependencies though, so
I obviously don't write everything. What I don't want is something so complex
that I can't maintain it working on it just 4 hours a week. So I'll reinvent the
wheel, but not the road perhaps is a way to look at it.
