import * as Path from "@std/path";
import * as Fs from "@std/fs";
import { encodeBase64Url } from "@std/encoding/base64url";
import { crypto } from "@std/crypto";
import { callRoute } from "./serve.ts";

const { config } = await import(Path.join(Deno.cwd(), "flint.ts"));
const urls = {};

const distDir = Path.join(Deno.cwd(), "dist");
const publicDir = Path.join(Deno.cwd(), "public");

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

				content = await plugin.handler({ path: file.path, content, urls });

				let path = Path.join(
					distDir,
					"public",
					file.path.substring(publicDir.length),
				);

				if (!path.endsWith(".html") && !path.endsWith(".rss")) {
					const subpath = path.substring(Path.join(distDir, "public").length);

					const buffer = await crypto.subtle.digest("SHA-256", content);
					const fingerprint = encodeBase64Url(buffer);
					const withFingerprint = Path.format({
						root: "/",
						dir: Path.dirname(path).substring(
							Path.join(distDir, "public").length,
						),
						ext: `.${fingerprint}${Path.extname(path)}`,
						name: Path.basename(path, Path.extname(path)),
					});

					urls[subpath] = withFingerprint;

					path = Path.join(distDir, "public", withFingerprint);
				}

				await Fs.ensureDir(Path.dirname(path));

				await Deno.writeFile(path, content);
			}
		}
	}

	const notFoundBody = await callRoute(config.notFound, urls);

	const path = Path.join("dist", "public/404.html");

	await Fs.ensureDir(Path.dirname(path));

	await Deno.writeTextFile(
		path,
		notFoundBody,
	);

	for (const route of config.routes) {
		let { cache, pattern } = route;
		if (cache !== false) {
			const files: Array<string> = [];

			if (
				(cache === true || cache == null) && typeof pattern === "string" &&
				!/[\:\?\+\*\{\}\(\)]/.test(pattern)
			) {
				files.push(pattern);
			} else if (typeof cache === "string") {
				files.push(cache);
			} else if (Array.isArray(cache)) {
				files.push(...cache);
			} else if (typeof cache === "function") {
				files.push(...(await cache()));
			}

			pattern = pattern instanceof URLPattern
				? pattern
				: new URLPattern({ pathname: pattern });

			for (let file of files) {
				const match = pattern.exec(new URL(`http://localhost${file}`));

				if (!match) continue;

				const body = await callRoute(route, urls, match.pathname.groups);

				if (file.endsWith("/")) {
					file += "index.html";
				}

				const path = Path.join("dist", "public", file);

				await Fs.ensureDir(Path.dirname(path));

				await Deno.writeTextFile(
					path,
					body,
				);
			}
		}
	}

	await Deno.writeTextFile(
		Path.join(distDir, "serve.ts"),
		`
		import * as Path from "@std/path";
		import serve from "../app/serve.ts";

		const { config } = await import(Path.join(Deno.cwd(), "flint.ts"));
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
