import * as Path from "@std/path";
import * as Fs from "@std/fs";
import { optimizeHTML, saveView } from "./html.ts";
import { saveRSS } from "./rss.ts";
import { saveCacheBusted } from "./utils/cache-busting.ts";
import { optimizeCSS } from "./css.ts";
import { optimizeJS } from "./js.ts";
import { getSite } from "./models/site.ts";
import { getResume } from "./models/resume.ts";
import { getPublishedPosts } from "./models/post.ts";
import { embedProjects } from "./projects.ts";
import NotFoundView from "./templates/not-found.js";
import PostView from "./templates/post.js";
import HomeView from "./templates/home.js";
import ResumeView from "./templates/resume.js";

export { render } from "handcraft/env/server.js";

export const distDir = Path.join(Deno.cwd(), "dist");
export const cacheBustedUrls = new Map();
export const jsImports = new Map();
export const cssImports = new Map();

if (import.meta.main) {
  await Fs.ensureDir("./dist");

  if (Deno.args.includes("--clean")) {
    await Fs.emptyDir("./dist");
  }

  await Fs.copy("./public", "./dist", {
    overwrite: true,
    preserveTimestamps: true,
  });
  await embedProjects();

  const [fontFiles, cssFiles, jsFiles] = await Promise.all([
    "./dist/fonts/*.woff2",
    "./dist/**/*.css",
    "./dist/**/*.js",
  ].map((url) => Array.fromAsync(Fs.expandGlob(url))));

  await Promise.all([
    ...fontFiles.map(
      ({ path }) => saveCacheBusted(path),
    ),
    saveCacheBusted(
      Path.join(distDir, "favicon-light.png"),
    ),
    saveCacheBusted(
      Path.join(distDir, "favicon-dark.png"),
    ),
  ]);

  await Promise.all([
    ...cssFiles.map(
      async ({ path }) => {
        const imports: Array<string> = [];

        await optimizeCSS(path, imports);

        cssImports.set(
          path.slice(distDir.length),
          imports,
        );
      },
    ),
    ...jsFiles.map(
      async ({ path }) => {
        const imports: Array<string> = [];

        await optimizeJS(path, imports);

        jsImports.set(
          path.slice(distDir.length),
          imports,
        );
      },
    ),
  ]);

  const [site, posts, resume] = await Promise.all([
    getSite(),
    getPublishedPosts(),
    getResume(),
  ]);

  await saveView("./dist/404.html", () => NotFoundView({ site }));

  for (const post of posts) {
    await saveView(
      `./dist/posts/${post.slug}/index.html`,
      () => PostView({ site, post }),
    );
  }

  await saveView(`./dist/index.html`, () => HomeView({ site, posts }));
  await saveView(`./dist/resume/index.html`, () => ResumeView({ resume }));
  await saveRSS({ site, posts });

  for await (const { path } of Fs.expandGlob("./dist/**/*.html")) {
    await optimizeHTML(path);
  }
}
