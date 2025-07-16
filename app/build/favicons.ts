import * as Path from "@std/path";
import { distDir, write } from "../build.ts";

export async function processFavicons() {
	await Promise.all(
		["favicon-light.png", "favicon-dark.png"].map((name) =>
			Deno.readFile(Path.join("./public", name)).then((c) =>
				write(Path.join(distDir, name), c)
			)
		),
	);
}
