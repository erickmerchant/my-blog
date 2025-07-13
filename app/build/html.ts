import * as Path from "@std/path";
import * as Fs from "@std/fs";
import * as HTMLMinifier from "html-minifier";
import { DOMParser } from "linkedom";
import { effect } from "handcraft/reactivity.js";
import { distDir, render } from "../build.ts";
import { cssImports } from "./css.ts";

type View = { deref: () => Element };

export async function saveView(path: string, view: () => Promise<View> | View) {
	const el = await view();
	const { promise, resolve } = Promise.withResolvers<string>();

	effect(() => {
		resolve(`<!doctype html>${render(el.deref())}`);
	});

	const html = await promise;

	if (
		html.includes(`(...args) => {
				element.attr(key, ...args);

				return p;
			}`)
	) {
		throw Error("fail");
	}

	await Fs.ensureDir(Path.dirname(path));
	await Deno.writeTextFile(path, html);
}

export async function optimizeHTML(path: string) {
	const content = await Deno.readTextFile(path);

	const doc = new DOMParser().parseFromString(content, "text/html");

	if (doc) {
		const preloads = new Set<string>();

		for (
			const el of doc.querySelectorAll(
				"link[href][rel='stylesheet'], style",
			)
		) {
			const href = el.getAttribute("href");

			if (href) {
				if (href.startsWith("http://") || href.startsWith("https://")) continue;

				const resolvedHref = Path.resolve(
					Path.dirname(path.substring(distDir.length)),
					href,
				);

				for (const url of cssImports.get(resolvedHref) ?? []) {
					preloads.add(url);
				}
			}
		}

		const firstStylesheet = doc.querySelectorAll("link[rel='stylesheet']")?.[0];

		if (firstStylesheet) {
			for (const preload of preloads) {
				if (preload.endsWith(".woff2")) {
					firstStylesheet.insertAdjacentHTML(
						"beforebegin",
						`<link rel="preload" href="${preload}" as="font" type="font/woff2" crossorigin>`,
					);
				}
			}
		}

		const code = HTMLMinifier.minify(`${doc}`, {
			collapseWhitespace: true,
			removeComments: true,
		});

		if (
			code.includes(`(...args) =&gt; { element.attr(key, ...args); return p; }`)
		) {
			throw Error("fail");
		}

		await Deno.writeTextFile(path, code);
	}
}
