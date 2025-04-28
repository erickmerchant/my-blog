import "./setup.ts";
import * as Fs from "@std/fs";
import * as Toml from "@std/toml";
import * as Marked from "marked";
import { XMLBuilder } from "fast-xml-parser";
import { HandcraftElement } from "handcraft/prelude/all.js";
import NotFoundView from "./templates/not_found.ts";
import PostView from "./templates/post.ts";
import HomeView from "./templates/home.ts";
import ResumeView from "./templates/resume.ts";

if (import.meta.main) {
  /* copy public to dist */
  await Fs.ensureDir("./dist");
  await Fs.emptyDir("./dist");
  await Fs.copy("./public", "./dist", {
    overwrite: true,
    preserveTimestamps: true,
  });

  /* create site model */
  const siteContent = await Deno.readTextFile("./content/site.toml");
  const site = Toml.parse(siteContent) as Site;

  for (const project of site.projects) {
    project.description = await Marked.parse(project.description);
  }

  site.bio = await Marked.parse(site.bio);

  /* create 404.html */
  const notFoundHTML = await toHTML(NotFoundView({ site }));

  await Deno.writeTextFile("./dist/404.html", notFoundHTML);

  /* create post models and posts/{slug}/index.html */
  const posts: Array<Post> = [];
  const rss = {
    attributes: { version: "2.0" },
    channel: {
      title: "Posts",
      link: `${site.host}/posts.rss`,
      copyright: site.author,
      item: [],
    },
  };

  for await (const { name, path } of Fs.expandGlob("./content/posts/*.md")) {
    const matched = name.match(/(.*?)\.md/);

    if (!matched) continue;

    const [, slug] = matched;
    const text = await Deno.readTextFile(path);
    const [, toml, md] = text.split("+++\n");
    const frontmatter = Toml.parse(toml);

    frontmatter.date_published = frontmatter.date_published !== null
      ? new Date(frontmatter.date_published as string)
      : null;

    const content = await Marked.parse(md);
    const post: Post = {
      slug,
      content,
      ...frontmatter,
    } as Post;

    posts.push(post);

    rss.channel.item.push({
      title: post.title,
      link: `${site.host}/posts/${slug}/`,
      pubDate: buildRFC822Date(post.date_published),
    });

    const postHTML = await toHTML(PostView({ site, post }));

    await Fs.ensureDir(`./dist/posts/${slug}`);

    await Deno.writeTextFile(`./dist/posts/${slug}/index.html`, postHTML);
  }
  /* create posts.rss */
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributesGroupName: "attributes",
  });

  const rssContent = builder.build(rss);

  await Deno.writeTextFile(
    `./dist/posts.rss`,
    `<?xml version="1.0" encoding="utf-8"?>${rssContent}`,
  );

  /* create index.html */
  const homeHTML = await toHTML(HomeView({ site, posts }));

  await Deno.writeTextFile(`./dist/index.html`, homeHTML);

  /* create resume model */
  const resumeContent = await Deno.readTextFile("./content/resume.toml");
  const resume = Toml.parse(resumeContent) as Resume;

  resume.objective = await Marked.parse(resume.objective);

  for (const r of resume.education) {
    r.summary = await Marked.parse(r.summary);
  }

  for (const r of resume.history) {
    r.summary = await Marked.parse(r.summary);
  }

  /* create resume/index.html */
  const resumeHTML = await toHTML(ResumeView({ resume }));

  await Fs.ensureDir(`./dist/resume`);
  await Deno.writeTextFile(`./dist/resume/index.html`, resumeHTML);
}

async function toHTML(el: HandcraftElement) {
  const { promise, resolve } = Promise.withResolvers();

  setTimeout(() => {
    resolve(`<!doctype html>${el.deref().innerHTML}`);
  }, 0);

  return await promise;
}

/* https://whitep4nth3r.com/blog/how-to-format-dates-for-rss-feeds-rfc-822/ */
function buildRFC822Date(date) {
  const dayStrings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthStrings = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = dayStrings[date.getDay()];
  const dayNumber = addLeadingZeros(date.getDate());
  const month = monthStrings[date.getMonth()];
  const year = date.getFullYear();
  const time = `${addLeadingZeros(date.getHours())}:${
    addLeadingZeros(date.getMinutes())
  }:00`;
  const timezone = addLeadingZeros(date.getTimezoneOffset(), 4);

  //Wed, 02 Oct 2002 13:00:00 GMT
  return `${day}, ${dayNumber} ${month} ${year} ${time} ${
    timezone.startsWith("-") ? "" : "+"
  }${timezone}`;
}

export function addLeadingZeros(str: string | number, length = 2) {
  return ("0".repeat(length) + str).slice(-1 * length);
}
