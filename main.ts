import * as Path from "@std/path";
import * as Fs from "@std/fs";
import * as Toml from "@std/toml";
import * as Marked from "marked";
import * as HTMLMinifier from "html-minifier";
import { alterHTML, saveHTML } from "./app/util/html.ts";
import { saveRSS } from "./app/util/rss.ts";
import { moveCacheBusted, saveCacheBusted } from "./app/util/cache-busting.ts";
import { asRFC822Date } from "./app/util/misc.ts";
import { runLightning, runSWC } from "./app/util/assets.ts";
import NotFoundView from "./app/templates/not_found.ts";
import PostView from "./app/templates/post.ts";
import HomeView from "./app/templates/home.ts";
import ResumeView from "./app/templates/resume.ts";

export const cacheBustedUrls = new Map();
export const distDir = Path.join(Deno.cwd(), "dist");

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
  await saveHTML("./dist/404.html", () => NotFoundView({ site }));

  /* create post models and posts/{slug}/index.html */
  const posts: Array<Post> = [];
  const rssItems: Array<RssItem> = [];
  const rss: RSS = {
    attributes: { version: "2.0" },
    channel: {
      title: "Posts",
      link: `${site.host}/posts.rss`,
      copyright: site.author,
      item: rssItems,
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

    if (post.date_published) {
      rssItems.push({
        title: post.title,
        link: `${site.host}/posts/${slug}/`,
        pubDate: asRFC822Date(post.date_published),
      });
    }

    await saveHTML(
      `./dist/posts/${slug}/index.html`,
      () => PostView({ site, post }),
    );
  }

  await saveRSS(rss);

  /* create index.html */
  await saveHTML(`./dist/index.html`, () => HomeView({ site, posts }));

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
  await saveHTML(`./dist/resume/index.html`, () => ResumeView({ resume }));

  /* minify css */
  for await (const { path } of Fs.expandGlob("./dist/**/*.css")) {
    const cssContent = await Deno.readFile(path);
    const code = await runLightning(path, cssContent);

    await saveCacheBusted(path, code);
  }

  const jsImports = new Map();

  /* minify js */
  for await (const { path } of Fs.expandGlob("./dist/**/*.js")) {
    const jsContent = await Deno.readTextFile(path);
    const imports: Array<string> = [];
    const code = await runSWC(path, jsContent, imports);

    jsImports.set(
      path.slice(distDir.length),
      imports,
    );

    await saveCacheBusted(path, code);
  }

  const lightFaviconPath = await moveCacheBusted(
    Path.join(distDir, "favicon-light.png"),
  );
  const darkFaviconPath = await moveCacheBusted(
    Path.join(distDir, "favicon-dark.png"),
  );

  /* minify html */
  for await (const { path } of Fs.expandGlob("./dist/**/*.html")) {
    await alterHTML(
      path,
      await Deno.readTextFile(path),
      async (document) => {
        const html = document.querySelector("html");

        if (html) {
          const usedJSImports: Array<string> = [];
          const head = html.querySelector("head");
          let importMap;

          if (head) {
            head.insertAdjacentHTML(
              "beforeend",
              `<link rel="icon" href="${lightFaviconPath}" type="image/svg+xml" media="(prefers-color-scheme: light)" />`,
            );

            head.insertAdjacentHTML(
              "beforeend",
              `<link rel="icon" href="${darkFaviconPath}" type="image/svg+xml" media="(prefers-color-scheme: dark)" />`,
            );
          }

          for (
            const link of html.querySelectorAll("link[href][rel='stylesheet']")
          ) {
            const href = link.getAttribute("href");

            if (href) {
              if (
                !href.startsWith("/") && !href.startsWith("./") &&
                !href.startsWith("../")
              ) continue;

              link.setAttribute(
                "href",
                cacheBustedUrls.get(
                  Path.resolve(Path.dirname(path.slice(distDir.length)), href),
                ),
              );
            }
          }

          for (
            const script of html.querySelectorAll("script[type='importmap']")
          ) {
            importMap = JSON.parse(script.textContent);
          }

          for (
            const script of html.querySelectorAll("script[src]")
          ) {
            const src = script.getAttribute("src");

            if (src) {
              if (
                !src.startsWith("/") && !src.startsWith("./") &&
                !src.startsWith("../")
              ) continue;

              usedJSImports.push(
                Path.resolve(Path.dirname(path.slice(distDir.length)), src),
              );

              script.setAttribute(
                "src",
                cacheBustedUrls.get(
                  Path.resolve(Path.dirname(path.slice(distDir.length)), src),
                ),
              );
            }
          }

          for (
            const script of html.querySelectorAll("script[type='module']")
          ) {
            const src = script.getAttribute("src");

            if (!src) {
              const jsContent = script.textContent;
              const imports: Array<string> = [];
              const code = await runSWC(path, jsContent, imports);

              usedJSImports.push(...imports);

              script.textContent = code;
            }
          }

          const code = HTMLMinifier.minify(`<!doctype html>${html.outerHTML}`, {
            collapseWhitespace: true,
          });

          console.log(usedJSImports, importMap);

          if (importMap) {
            // unprocessedJSImports = usedJSImports
            // for each unprocessedJSImports as specifier
            //    resolve the specifier through the imporMap if it doesn't start with / ./ or ../
            //  update import map with specifier: resolved
            //  get fullPath with Path.resolve(Path.dirname(path.slice(distDir.length)), src)
            //    add preload tag with fullPath
            //  add to processedJSImports
            //  get dependencies from jsImports and add to unprocessedJSImports if not in processedJSImports
          }

          return code;
        }
      },
    );
  }
}
