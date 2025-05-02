import * as LightningCSS from "lightningcss";
import { saveCacheBusted } from "./cache-busting.ts";

export function runLightning(
  path: string,
  content: Uint8Array,
): Promise<string> {
  const { code } = LightningCSS.transform({
    filename: path,
    code: content,
    minify: true,
    sourceMap: false,
  });

  return Promise.resolve(code.toString());
}

export async function optimizeCSS(path: string) {
  const cssContent = await Deno.readFile(path);
  const code = await runLightning(path, cssContent);

  await saveCacheBusted(path, code);
}
