import * as Path from "@std/path";
import * as Fs from "@std/fs";
import { HandcraftElement } from "handcraft/prelude/all.js";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { Document, Window } from "happy-dom";
import { distDir } from "../main.ts";

export async function saveHTML(path: string, view: () => HandcraftElement) {
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
