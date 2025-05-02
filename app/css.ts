import * as LightningCSS from "lightningcss";
import { saveCacheBusted } from "./cache-busting.ts";
import { cacheBustedUrls } from "../main.ts";
import * as Path from "@std/path";

export function runLightning(
  path: string,
  content: Uint8Array,
): Promise<string> {
  const { code } = LightningCSS.transform({
    filename: path,
    code: content,
    minify: true,
    sourceMap: false,
    visitor: {
      Url(url) {
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

export async function optimizeCSS(path: string) {
  const cssContent = await Deno.readFile(path);
  const code = await runLightning(path, cssContent);

  await saveCacheBusted(path, code);
}
