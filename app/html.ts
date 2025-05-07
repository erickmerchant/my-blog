import * as Path from "@std/path";
import * as Fs from "@std/fs";
import * as HTMLMinifier from "html-minifier";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { Document, Element, Window } from "happy-dom";
import { cacheBustedUrls, cssImports, distDir, jsImports } from "../main.ts";
import { runSWC } from "./js.ts";

export async function saveView(path: string, view: () => { self: Element }) {
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
    resolve(`<!doctype html>${el.self.outerHTML}`);
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
        let importMap;
        const newImportMap: { imports: Record<string, string> } = {
          imports: {},
        };
        const modulePreloads = new Set<string>();
        const preloads = new Set<string>();
        const head = html.querySelector("head");
        let inlineCSS = "";

        for (
          const el of html.querySelectorAll(
            "link[href][rel='stylesheet'], style",
          )
        ) {
          const href = el.getAttribute("href");

          if (href) {
            if (
              href.startsWith("http://") || href.startsWith("https://")
            ) continue;

            const resolvedHref = Path.resolve(
              Path.dirname(path.substring(distDir.length)),
              href,
            );

            for (const url of cssImports.get(resolvedHref)) {
              preloads.add(
                cacheBustedUrls.get(Path.resolve(resolvedHref, url)),
              );
            }

            const cacheBustedUrl = cacheBustedUrls.get(
              resolvedHref,
            );

            if (!Deno.args.includes("--inline-css")) {
              el.setAttribute(
                "href",
                cacheBustedUrl,
              );
            } else {
              inlineCSS += await Deno.readTextFile(
                Path.join(
                  distDir,
                  cacheBustedUrl,
                ),
              );

              el.remove();
            }
          } else if (
            el.tagName === "STYLE" && Deno.args.includes("--inline-css")
          ) {
            inlineCSS += el.textContent;

            el.remove();
          }
        }

        if (inlineCSS) {
          const style = document.createElement("style");

          style.textContent = inlineCSS;

          const firstLink = html.querySelector("link:nth-of-type(1)");

          if (firstLink) {
            firstLink.insertAdjacentElement("beforebegin", style);
          } else {
            if (head) head.insertAdjacentElement("beforeend", style);
          }
        }

        const firstStylesheet = !Deno.args.includes("--inline-css")
          ? html.querySelector(
            "link:nth-child(1 of [rel='stylesheet'])",
          )
          : html.querySelector(
            "style:nth-of-type(1)",
          );

        if (firstStylesheet) {
          for (const preload of preloads) {
            if (preload.endsWith(".woff2")) {
              firstStylesheet.insertAdjacentHTML(
                "beforebegin",
                `<link rel="preload" href="${preload}" as="font" type="font/woff2" crossorigin>`,
              );
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

                  modulePreloads.add(newSpecifier);

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

              modulePreloads.add(newSpecifier);
            }
          }

          const importMapScript = html.querySelector(
            "script[type='importmap']",
          );

          if (importMapScript) {
            importMapScript.textContent = JSON.stringify(newImportMap);

            for (const modulePreload of modulePreloads) {
              importMapScript.insertAdjacentHTML(
                "afterend",
                `<link rel="modulepreload" href="${modulePreload}" as=>`,
              );
            }
          }
        }

        if (head) {
          head.insertAdjacentHTML(
            "beforeend",
            `<link rel="icon" href="${
              cacheBustedUrls.get("/favicon-light.png")
            }" type="image/svg+xml" media="(prefers-color-scheme: light)" as=>`,
          );

          head.insertAdjacentHTML(
            "beforeend",
            `<link rel="icon" href="${
              cacheBustedUrls.get("/favicon-dark.png")
            }" type="image/svg+xml" media="(prefers-color-scheme: dark)" as=>`,
          );
        }

        const code = HTMLMinifier.minify(`<!doctype html>${html.outerHTML}`, {
          collapseWhitespace: true,
          removeComments: true,
        });

        return code;
      }
    },
  );
}
