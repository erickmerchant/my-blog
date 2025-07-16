import * as Path from "@std/path";
import * as Fs from "@std/fs";
import { encodeBase64Url } from "@std/encoding/base64url";
import { crypto } from "@std/crypto";
import { saveView } from "./build/html.ts";
import { saveRSS } from "./build/rss.ts";
import { processCSS } from "./build/css.ts";
import { processFonts } from "./build/fonts.ts";
import { processFavicons } from "./build/favicons.ts";
import { getSite } from "./models/site.ts";
import { getResume } from "./models/resume.ts";
import { getPublishedPosts } from "./models/post.ts";
import NotFoundView from "./views/not-found.js";
import PostView from "./views/post.js";
import HomeView from "./views/home.js";
import ResumeView from "./views/resume.js";

export { render } from "handcraft/env/server.js";

export const urlMap = new Map();
export const distDir = Path.join(Deno.cwd(), "dist");
export const publicDir = Path.join(Deno.cwd(), "public");

if (import.meta.main) {
	await Promise.all([processFonts(), processFavicons()]);

	await processCSS();

	const [site, posts, resume] = await Promise.all([
		getSite(),
		getPublishedPosts(),
		getResume(),
	]);

	await Promise.all([
		saveView("./dist/404.html", () => NotFoundView({ site })),
		...posts.map((post) =>
			saveView(
				`./dist/posts/${post.slug}/index.html`,
				() => PostView({ site, post }),
			)
		),
		saveView(`./dist/index.html`, () => HomeView({ site, posts })),
		saveView(`./dist/resume/index.html`, () => ResumeView({ resume })),
		saveRSS({ site, posts }),
	]);
}

export function getUrl(path: string) {
	return urlMap.get(path);
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
			urlMap.set(path.substring(distDir.length), subpath);
		} else {
			const buffer = await getFingerprint(code);
			const fingerprint = encodeBase64Url(buffer);
			const withFingerprint = Path.format({
				root: "/",
				dir: Path.dirname(path).substring(distDir.length),
				ext: `.${fingerprint}${Path.extname(path)}`,
				name: Path.basename(path, Path.extname(path)),
			});

			urlMap.set(subpath, withFingerprint);

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
