import * as LightningCSS from "lightningcss";
import { saveCacheBusted } from "./cache-busting.ts";
import { cacheBustedUrls } from "../main.tsx";
import * as Path from "@std/path";

export function runLightning(
  path: string,
  content: Uint8Array,
  imports: Array<string>,
): Promise<string> {
  const { code } = LightningCSS.transform({
    filename: path,
    code: content,
    minify: true,
    sourceMap: false,
    visitor: {
      Url(url) {
        imports.push(url.url);

        return {
          ...url,
          url: cacheBustedUrls.get(Path.resolve(
            path,
            url.url,
          )),
        };
      },
    },
  });

  return Promise.resolve(code.toString());
}

export async function optimizeCSS(path: string, imports: Array<string>) {
  const cssContent = await Deno.readFile(path);
  const code = await runLightning(path, cssContent, imports);

  await saveCacheBusted(path, code);
}
