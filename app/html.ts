import * as Path from "@std/path";
import * as Fs from "@std/fs";
import * as HTMLMinifier from "html-minifier";
import { HandcraftElement } from "handcraft/prelude/all.js";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { Document, Window } from "happy-dom";
import { cacheBustedUrls, distDir, jsImports } from "../main.ts";
import { runSWC } from "./js.ts";

export async function saveView(path: string, view: () => HandcraftElement) {
  GlobalRegistrator.register({
    url: "http://localhost:3000",
    width: 1920,
    height: 1080,
    settings: {
      fetch: {
        virtualServers: [
          {
            url: "https://localhost:3000",
            directory: "./dist",
          },
        ],
      },
    },
  });

  const el = view();

  const { promise, resolve } = Promise.withResolvers<string>();

  setTimeout(() => {
    resolve(`<!doctype html>${el.deref().innerHTML}`);
  }, 0);

  const html = await promise;

  await GlobalRegistrator.unregister();

  await Fs.ensureDir(Path.dirname(path));

  await Deno.writeTextFile(path, html);
}

export async function alterHTML(
  path: string,
  content: string,
  cb: (document: Document) => Promise<string | undefined>,
) {
  const subpath = path.substring(distDir.length);

  const window = new Window({
    width: 1920,
    height: 1080,
    url: `http://localhost:3000${subpath}`,
    settings: {
      handleDisabledFileLoadingAsSuccess: true,
      disableCSSFileLoading: true,
      disableJavaScriptFileLoading: true,
      fetch: {
        virtualServers: [
          {
            url: "https://localhost:3000",
            directory: "./dist",
          },
        ],
      },
    },
  });
  const document = window.document;

  document.write(content);

  const html = await cb(document);

  if (html) {
    await Deno.writeTextFile(path, html);
  }

  const result = `<!doctype html>${document.querySelector("html")?.outerHTML}`;

  return result;
}

export async function optimizeHTML(path: string) {
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
            `<link rel="icon" href="${
              cacheBustedUrls.get("/favicon-light.png")
            }" type="image/svg+xml" media="(prefers-color-scheme: light)" />`,
          );

          head.insertAdjacentHTML(
            "beforeend",
            `<link rel="icon" href="${
              cacheBustedUrls.get("/favicon-dark.png")
            }" type="image/svg+xml" media="(prefers-color-scheme: dark)" />`,
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
