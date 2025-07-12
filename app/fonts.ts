import * as Fs from "@std/fs";
import { saveCacheBusted } from "./utils/cache-busting.ts";

export async function processFonts() {
  const fontFiles = await Array.fromAsync(
    Fs.expandGlob("./dist/fonts/*.woff2"),
  );

  await Promise.all(fontFiles.map(
    ({ path }) => saveCacheBusted(path),
  ));
}
