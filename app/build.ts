import * as Path from "@std/path";
import * as Fs from "@std/fs";
import { encodeBase64Url } from "@std/encoding/base64url";
import { crypto } from "@std/crypto";

const { config } = await import(Path.join(Deno.cwd(), "config.ts"));
const urls = {};

export const distDir = Path.join(Deno.cwd(), config.dist ?? "dist");
export const publicDir = Path.join(Deno.cwd(), config.public ?? "public");

if (import.meta.main) {
	await Fs.emptyDir(distDir);

	await Fs.ensureDir(distDir);

	const files = await Array.fromAsync(
		Fs.expandGlob(Path.join(publicDir, "**")),
	);

	for (const plugin of config.plugins) {
		for (const file of files) {
			const pattern = plugin.pattern instanceof URLPattern
				? plugin.pattern
				: new URLPattern({ pathname: plugin.pattern });
			if (pattern.test(`file://${file.path}`)) {
				let content = await Deno.readFile(file.path);

				content = await plugin.run(
					file.path,
					content,
					urls,
				);

				await write(
					Path.join(distDir, "public", file.path.substring(publicDir.length)),
					content,
					false,
				);
			}
		}
	}

	await Deno.writeTextFile(
		Path.join(distDir, "serve.ts"),
		`
		import * as Path from "@std/path";
		import serve from "../app/serve.ts";

		const { config } = await import(Path.join(Deno.cwd(), "config.ts"));
		const urls = ${JSON.stringify(urls)};

		const handler = serve({...config, urls})

		export default {
			fetch(req: Request) {
				return handler(req);
			}
		}
	`,
	);
}

async function getFingerprint(code: Uint8Array<ArrayBufferLike>) {
	const buffer = await crypto.subtle.digest("SHA-256", code);
	const fingerprint = encodeBase64Url(buffer);

	return fingerprint;
}

export async function write(
	path: string,
	code: Uint8Array<ArrayBufferLike>,
	dev: boolean,
) {
	if (!path.endsWith(".html") && !path.endsWith(".rss")) {
		const subpath = path.substring(Path.join(distDir, "public").length);

		if (dev) {
			urls[subpath] = subpath;
		} else {
			const buffer = await getFingerprint(code);
			const fingerprint = encodeBase64Url(buffer);
			const withFingerprint = Path.format({
				root: "/",
				dir: Path.dirname(path).substring(Path.join(distDir, "public").length),
				ext: `.${fingerprint}${Path.extname(path)}`,
				name: Path.basename(path, Path.extname(path)),
			});

			urls[subpath] = withFingerprint;

			path = Path.join(distDir, "public", withFingerprint);
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
