import * as Fs from "@std/fs";
import * as Path from "@std/path";
import * as LightningCSS from "lightningcss";
import { distDir, getUrl, publicDir, write } from "../build.ts";

async function optimizeCSS(path: string) {
	const content = await Deno.readFile(path);
	const { code } = LightningCSS.transform({
		filename: path,
		code: content,
		minify: true,
		sourceMap: false,
		visitor: {
			Url(url) {
				return {
					...url,
					url: getUrl(Path.resolve(path, url.url)),
				};
			},
		},
	});
	const p = Path.join(distDir, path.substring(publicDir.length));

	await write(p, code);
}

export async function processCSS() {
	const cssFiles = await Array.fromAsync(Fs.expandGlob("./public/**/*.css"));

	await Promise.all(
		cssFiles.map(async ({ path }) => {
			await optimizeCSS(path);
		}),
	);
}
