import * as Path from "@std/path";
import * as Fs from "@std/fs";
import * as HTMLMinifier from "html-minifier";
import { effect } from "handcraft/reactivity.js";
import { render, write } from "../build.ts";

type View = { deref: () => Element };

export async function saveView(path: string, view: () => Promise<View> | View) {
	const el = await view();
	const { promise, resolve } = Promise.withResolvers<string>();

	effect(() => {
		resolve(`<!doctype html>${render(el.deref())}`);
	});

	let html = await promise;

	await Fs.ensureDir(Path.dirname(path));

	if (Deno.args.includes("--dev")) {
		html += `<script type="module">
			let esrc = new EventSource("/_watch");

			esrc.addEventListener("message", (e) => {
					window.location.reload()
			});
		</script>
		`;

		html = HTMLMinifier.minify(html, {
			collapseWhitespace: true,
			removeComments: true,
		});
	}

	const encoder = new TextEncoder();

	await write(path, encoder.encode(html));
}
