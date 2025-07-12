import * as Path from "@std/path";
import * as Fs from "@std/fs";
import { optimizeHTML, saveView } from "../build/html.ts";
import { saveRSS } from "../build/rss.ts";
import { processCSS } from "../build/css.ts";
import { processFonts } from "../build/fonts.ts";
import { processFavicons } from "../build/favicons.ts";
import { getSite } from "../models/site.ts";
import { getResume } from "../models/resume.ts";
import { getPublishedPosts } from "../models/post.ts";
import NotFoundView from "../views/not-found.js";
import PostView from "../views/post.js";
import HomeView from "../views/home.js";
import ResumeView from "../views/resume.js";

export { render } from "handcraft/env/server.js";

export const distDir = Path.join(Deno.cwd(), "dist");
export const cacheBustedUrls = new Map();

export function getUrl(path) {
  return cacheBustedUrls.get(path);
}

if (import.meta.main) {
  await Fs.ensureDir("./dist");

  await Fs.emptyDir("./dist");

  await Fs.copy("./public", "./dist", {
    overwrite: true,
    preserveTimestamps: true,
  });

  await Promise.all([processFonts(), processFavicons()]);

  await processCSS();

  const [site, posts, resume] = await Promise.all([
    getSite(),
    getPublishedPosts(),
    getResume(),
  ]);

  await Promise.all([
    saveView("./dist/404.html", () => NotFoundView({ site })),
    ...posts.map((post) =>
      saveView(
        `./dist/posts/${post.slug}/index.html`,
        () => PostView({ site, post }),
      )
    ),
    saveView(`./dist/index.html`, () => HomeView({ site, posts })),
    saveView(`./dist/resume/index.html`, () => ResumeView({ resume })),
    saveRSS({ site, posts }),
  ]);

  for await (const { path } of Fs.expandGlob("./dist/**/*.html")) {
    await optimizeHTML(path);
  }
}
