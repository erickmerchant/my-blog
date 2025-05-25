import * as Path from "@std/path";
import { encodeHex } from "@std/encoding/hex";
import { crypto } from "@std/crypto";
import { cacheBustedUrls, distDir } from "../main.ts";

export async function saveCacheBusted(
  path: string,
  code?: string,
) {
  if (!Deno.args.includes("--cache-bust")) {
    const subpath = path.substring(distDir.length);

    cacheBustedUrls.set(
      path.substring(distDir.length),
      subpath,
    );

    return subpath;
  }

  let content;

  if (code == null) {
    content = await Deno.readFile(path);
  } else {
    content = new Uint8Array(new TextEncoder().encode(code));
  }

  const fileHashBuffer = await crypto.subtle.digest(
    "MD5",
    content,
  );
  const fileHash = encodeHex(fileHashBuffer);
  const cacheBustedUrl = Path.format({
    root: "/",
    dir: Path.dirname(path).substring(distDir.length),
    ext: `.${fileHash}${Path.extname(path)}`,
    name: Path.basename(path, Path.extname(path)),
  });

  cacheBustedUrls.set(
    path.substring(distDir.length),
    cacheBustedUrl,
  );

  await Deno.writeFile(
    Path.join(Deno.cwd(), "dist", cacheBustedUrl),
    content,
  );

  await Deno.remove(path);

  return cacheBustedUrl;
}
