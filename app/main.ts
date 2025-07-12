import * as Path from "@std/path";
import * as Fs from "@std/fs";
import { serveDir } from "@std/http/file-server";
import { optimizeHTML, saveView } from "./html.ts";
import { saveRSS } from "./rss.ts";
import { processCSS } from "./css.ts";
import { processFonts } from "./fonts.ts";
import { processFavicons } from "./favicons.ts";
import { getSite } from "./models/site.ts";
import { getResume } from "./models/resume.ts";
import { getPublishedPosts } from "./models/post.ts";
import NotFoundView from "./views/not-found.js";
import PostView from "./views/post.js";
import HomeView from "./views/home.js";
import ResumeView from "./views/resume.js";

export { render } from "handcraft/env/server.js";

export const distDir = Path.join(Deno.cwd(), "dist");
export const cacheBustedUrls = new Map();

export function getUrl(path) {
  return cacheBustedUrls.get(path);
}

if (import.meta.main) {
  // @todo write handcraft plugin to call getUrl for hrefs and srcs
  // @todo convert to export default server

  if (Deno.args.includes("--dev")) {
    Deno.serve({ port: 4000 }, (req) => {
      return serveDir(req, {
        fsRoot: "dist",
      });
    });
  }

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
