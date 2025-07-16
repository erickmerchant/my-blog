import * as Fs from "@std/fs";
import * as Path from "@std/path";
import { distDir, publicDir, write } from "../build.ts";

export async function processFonts() {
	const fontFiles = await Array.fromAsync(
		Fs.expandGlob("./public/fonts/*.woff2"),
	);

	await Promise.all(
		fontFiles.map(({ path }) =>
			Deno.readFile(path).then((c) =>
				write(Path.join(distDir, path.substring(publicDir.length)), c)
			)
		),
	);
}
