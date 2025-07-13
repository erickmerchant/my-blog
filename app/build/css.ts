import * as Fs from "@std/fs";
import * as LightningCSS from "lightningcss";
import { saveCacheBusted } from "../utils/cache-busting.ts";
import { distDir, getUrl } from "../build.ts";
import * as Path from "@std/path";

export const cssImports = new Map();

async function optimizeCSS(path: string, imports: Array<string>) {
	const content = await Deno.readFile(path);
	const { code } = LightningCSS.transform({
		filename: path,
		code: content,
		minify: true,
		sourceMap: false,
		visitor: {
			Url(url) {
				imports.push(url.url);

				return {
					...url,
					url: getUrl(Path.resolve(path, url.url)),
				};
			},
		},
	});

	await saveCacheBusted(path, code.toString());
}

export async function processCSS() {
	const cssFiles = await Array.fromAsync(Fs.expandGlob("./dist/**/*.css"));

	await Promise.all(
		cssFiles.map(async ({ path }) => {
			const imports: Array<string> = [];

			await optimizeCSS(path, imports);

			cssImports.set(
				getUrl(path.slice(distDir.length)),
				imports.map((i) => getUrl(i)),
			);
		}),
	);
}
