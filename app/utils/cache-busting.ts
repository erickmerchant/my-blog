import * as Path from "@std/path";
import { encodeBase64Url } from "@std/encoding/base64url";
import { crypto } from "@std/crypto";
import { cacheBustedUrls, distDir } from "../build.ts";

export async function saveCacheBusted(path: string, code?: string) {
	const key = path.substring(distDir.length);

	if (Deno.args.includes("--dev")) {
		cacheBustedUrls.set(path.substring(distDir.length), key);

		return key;
	}

	let content: Uint8Array<ArrayBuffer>;

	if (code == null) {
		content = await Deno.readFile(path);
	} else {
		content = new Uint8Array(new TextEncoder().encode(code));
	}

	const fileHashBuffer = await crypto.subtle.digest("SHA-256", content);
	const fileHash = encodeBase64Url(fileHashBuffer);
	const cacheBustedUrl = Path.format({
		root: "/",
		dir: Path.dirname(path).substring(distDir.length),
		ext: `.${fileHash}${Path.extname(path)}`,
		name: Path.basename(path, Path.extname(path)),
	});

	cacheBustedUrls.set(key, cacheBustedUrl);

	await Deno.writeFile(Path.join(Deno.cwd(), "dist", cacheBustedUrl), content);

	await Deno.remove(path);

	return cacheBustedUrl;
}
