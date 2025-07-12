import * as Path from "@std/path";
import { saveCacheBusted } from "../utils/cache-busting.ts";
import { distDir } from "../cli/build.ts";

export async function processFavicons() {
  await Promise.all([
    saveCacheBusted(
      Path.join(distDir, "favicon-light.png"),
    ),
    saveCacheBusted(
      Path.join(distDir, "favicon-dark.png"),
    ),
  ]);
}
