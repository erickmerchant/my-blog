import * as Path from "@std/path";
import * as Fs from "@std/fs";

import { optimizeHTML, saveView } from "./app/html.ts";
import { saveRSS } from "./app/rss.ts";
import { moveCacheBusted } from "./app/cache-busting.ts";
import { optimizeCSS } from "./app/css.ts";
import { optimizeJS } from "./app/js.ts";
import { getSite } from "./app/models/site.ts";
import { getResume } from "./app/models/resume.ts";
import { getAllPosts } from "./app/models/post.ts";
import NotFoundView from "./app/templates/not_found.ts";
import PostView from "./app/templates/post.ts";
import HomeView from "./app/templates/home.ts";
import ResumeView from "./app/templates/resume.ts";

export const distDir = Path.join(Deno.cwd(), "dist");
export const cacheBustedUrls = new Map();
export const jsImports = new Map();

if (import.meta.main) {
  await Fs.ensureDir("./dist");
  await Fs.emptyDir("./dist");
  await Fs.copy("./public", "./dist", {
    overwrite: true,
    preserveTimestamps: true,
  });

  const site = await getSite();

  await saveView("./dist/404.html", () => NotFoundView({ site }));

  const posts = await getAllPosts();

  for (const post of posts) {
    await saveView(
      `./dist/posts/${post.slug}/index.html`,
      () => PostView({ site, post }),
    );
  }

  await saveRSS({ site, posts });

  await saveView(`./dist/index.html`, () => HomeView({ site, posts }));

  const resume = await getResume();

  await saveView(`./dist/resume/index.html`, () => ResumeView({ resume }));

  for await (const { path } of Fs.expandGlob("./dist/fonts/*.woff2")) {
    await moveCacheBusted(path);
  }

  for await (const { path } of Fs.expandGlob("./dist/**/*.css")) {
    await optimizeCSS(path);
  }

  for await (const { path } of Fs.expandGlob("./dist/**/*.js")) {
    const imports: Array<string> = [];

    await optimizeJS(path, imports);

    jsImports.set(
      path.slice(distDir.length),
      imports,
    );
  }

  await moveCacheBusted(
    Path.join(distDir, "favicon-light.png"),
  );

  await moveCacheBusted(
    Path.join(distDir, "favicon-dark.png"),
  );

  for await (const { path } of Fs.expandGlob("./dist/**/*.html")) {
    await optimizeHTML(path);
  }
}
