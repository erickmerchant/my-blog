import * as Path from "@std/path";
import { encodeHex } from "@std/encoding/hex";
import { crypto } from "@std/crypto";
import { cacheBustedUrls, distDir } from "../../main.ts";

export async function saveCacheBusted(path: string, code: string) {
  const encoder = new TextEncoder();
  const fileHashBuffer = await crypto.subtle.digest(
    "MD5",
    encoder.encode(code),
  );

  const fileHash = encodeHex(fileHashBuffer);
  const cacheBustedUrl = Path.format({
    root: "/",
    dir: Path.dirname(path).slice(distDir.length),
    ext: `.${fileHash}${Path.extname(path)}`,
    name: Path.basename(path, Path.extname(path)),
  });

  cacheBustedUrls.set(
    path.slice(distDir.length),
    cacheBustedUrl,
  );

  await Deno.writeTextFile(
    Path.join(Deno.cwd(), "dist", cacheBustedUrl),
    code,
  );

  await Deno.remove(path);

  return cacheBustedUrl;
}

export async function moveCacheBusted(path: string) {
  const content = await Deno.readFile(path);
  const fileHashBuffer = await crypto.subtle.digest(
    "MD5",
    content,
  );

  const fileHash = encodeHex(fileHashBuffer);
  const cacheBustedUrl = Path.format({
    root: "/",
    dir: Path.dirname(path).slice(distDir.length),
    ext: `.${fileHash}${Path.extname(path)}`,
    name: Path.basename(path, Path.extname(path)),
  });

  cacheBustedUrls.set(
    path.slice(distDir.length),
    cacheBustedUrl,
  );

  await Deno.writeFile(
    Path.join(Deno.cwd(), "dist", cacheBustedUrl),
    content,
  );

  await Deno.remove(path);

  return cacheBustedUrl;
}
