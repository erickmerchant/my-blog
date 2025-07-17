import * as Path from "@std/path";
import * as Fs from "@std/fs";
import { encodeBase64Url } from "@std/encoding/base64url";
import { crypto } from "@std/crypto";
import { processCSS } from "./plugins/css.ts";
import { processFiles } from "./plugins/files.ts";

export { render } from "handcraft/env/server.js";

export const urls = {};
export const distDir = Path.join(Deno.cwd(), "dist");
export const publicDir = Path.join(Deno.cwd(), "public");

if (import.meta.main) {
	await processFiles();

	await processCSS();
}

async function getFingerprint(code: Uint8Array<ArrayBufferLike>) {
	const buffer = await crypto.subtle.digest("SHA-256", code);
	const fingerprint = encodeBase64Url(buffer);

	return fingerprint;
}

export async function write(
	path: string,
	code: Uint8Array<ArrayBufferLike>,
) {
	if (!path.endsWith(".html") && !path.endsWith(".rss")) {
		const subpath = path.substring(distDir.length);

		if (Deno.args.includes("--dev")) {
			urls[path.substring(distDir.length)] = subpath;
		} else {
			const buffer = await getFingerprint(code);
			const fingerprint = encodeBase64Url(buffer);
			const withFingerprint = Path.format({
				root: "/",
				dir: Path.dirname(path).substring(distDir.length),
				ext: `.${fingerprint}${Path.extname(path)}`,
				name: Path.basename(path, Path.extname(path)),
			});

			urls[subpath] = withFingerprint;

			path = Path.join(Deno.cwd(), "dist", withFingerprint);
		}
	}

	const unchanged = await Deno.readFile(path).then(async (c) => {
		const fileFingerprint1 = await getFingerprint(c);
		const fileFingerprint2 = await getFingerprint(code);

		return fileFingerprint1 === fileFingerprint2;
	}).catch(
		() => false,
	);

	if (unchanged) return;

	await Fs.ensureDir(Path.dirname(path));

	await Deno.writeFile(path, code);
}
