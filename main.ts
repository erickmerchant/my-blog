import * as Path from "@std/path";
import * as Fs from "@std/fs";
import * as Toml from "@std/toml";
import * as Marked from "marked";
import * as HTMLMinifier from "html-minifier";
import { alterHTML, saveHTML } from "./app/html.ts";
import { saveRSS } from "./app/rss.ts";
import { moveCacheBusted, saveCacheBusted } from "./app/cache-busting.ts";
import { asRFC822Date } from "./app/utils.ts";
import { runLightning, runSWC } from "./app/assets.ts";
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

    const hasCode = /\n```/.test(md);
    const content = await Marked.parse(md);
    const post: Post = {
      slug,
      content,
      hasCode,
      ...frontmatter,
    } as Post;

    posts.push(post);

    await saveHTML(
      `./dist/posts/${slug}/index.html`,
      () => PostView({ site, post }),
    );
  }

  posts.sort((a, b) => {
    return b.date_published.getTime() - a.date_published.getTime();
  });

  for (const post of posts) {
    rssItems.push({
      title: post.title,
      link: `${site.host}/posts/${post.slug}/`,
      pubDate: asRFC822Date(post.date_published),
    });
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

    await saveCacheBusted(path, code);

    jsImports.set(
      path.slice(distDir.length),
      imports,
    );
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
          const newImportMap: { imports: Record<string, string> } = {
            imports: {},
          };
          const preloads = new Set();

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
                href.startsWith("http://") || href.startsWith("https://")
              ) continue;

              const cacheBustedUrl = cacheBustedUrls.get(
                Path.resolve(
                  Path.dirname(path.substring(distDir.length)),
                  href,
                ),
              );

              if (!Deno.args.includes("--inline-css")) {
                link.setAttribute(
                  "href",
                  cacheBustedUrl,
                );
              } else {
                const style = document.createElement("style");

                style.textContent = await Deno.readTextFile(
                  Path.join(
                    distDir,
                    cacheBustedUrl,
                  ),
                );

                link.replaceWith(style);
              }
            }
          }

          const importMapScript = html.querySelector(
            "script[type='importmap']",
          );

          if (importMapScript) {
            importMap = JSON.parse(importMapScript.textContent);
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

          const distPath = path.slice(distDir.length);

          if (importMap) {
            const unprocessedJSImports: Array<
              { specifier: string; path: string }
            > = usedJSImports.slice(0).map((specifier) => {
              return { specifier, path: distPath };
            });
            const processedJSImports = new Set();

            while (unprocessedJSImports.length) {
              const item = unprocessedJSImports.pop();

              if (!item) continue;

              let { specifier, path } = item;

              processedJSImports.add(`${specifier} ${path}`);

              if (
                !specifier.startsWith("/") && !specifier.startsWith("./") &&
                !specifier.startsWith("../")
              ) {
                for (
                  const [key, value] of Object.entries(importMap?.imports ?? {})
                    .toSorted(([a], [b]) => b.length - a.length)
                ) {
                  if (specifier.startsWith(key)) {
                    let newSpecifier = value + specifier?.substring(key.length);

                    newSpecifier = Path.resolve(
                      Path.dirname(path),
                      newSpecifier,
                    );

                    for (const dep of jsImports.get(newSpecifier) ?? []) {
                      if (!processedJSImports.has(`${dep} ${newSpecifier}`)) {
                        unprocessedJSImports.push({
                          path: newSpecifier,
                          specifier: dep,
                        });
                      }
                    }

                    newSpecifier = cacheBustedUrls.get(
                      newSpecifier,
                    );

                    preloads.add(newSpecifier);

                    newImportMap.imports[specifier] = newSpecifier;

                    break;
                  }
                }
              } else {
                specifier = Path.resolve(
                  Path.dirname(path),
                  specifier,
                );

                for (const dep of jsImports.get(specifier) ?? []) {
                  if (!processedJSImports.has(`${dep} ${specifier}`)) {
                    unprocessedJSImports.push({
                      path: specifier,
                      specifier: dep,
                    });
                  }
                }

                const newSpecifier = cacheBustedUrls.get(
                  specifier,
                );

                newImportMap.imports[specifier] = newSpecifier;

                preloads.add(newSpecifier);
              }
            }

            const importMapScript = html.querySelector(
              "script[type='importmap']",
            );

            if (importMapScript) {
              importMapScript.textContent = JSON.stringify(newImportMap);

              for (const preload of preloads) {
                importMapScript.insertAdjacentHTML(
                  "afterend",
                  `<link rel="modulepreload" href="${preload}" />`,
                );
              }
            }
          }

          const code = HTMLMinifier.minify(`<!doctype html>${html.outerHTML}`, {
            collapseWhitespace: true,
          });

          return code;
        }
      },
    );
  }
}
