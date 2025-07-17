import * as Path from "@std/path";
import { effect, render } from "handcraft/env/server.js";
import { serveDir } from "@std/http/file-server";
import { debounce } from "@std/async/debounce";

export default function (
	config: {
		views: Array<{ status?: number; pattern: URLPattern; serve: () => any }>;
		urls: Record<string, string>;
	},
) {
	return async (req: Request) => {
		const url = new URL(req.url);
		const headers: Array<string> = [];

		if (Deno.args.includes("--dev")) {
			if (url.pathname === "/_watch") {
				let watcher: Deno.FsWatcher;
				const body = new ReadableStream({
					async start(controller) {
						const enqueue = debounce(() => {
							controller.enqueue(
								new TextEncoder().encode(
									`data: "change"\r\n\r\n`,
								),
							);
						}, 500);

						watcher = Deno.watchFs(["dist"]);

						for await (const e of watcher) {
							console.log(e.kind, e.paths.join(" "));

							enqueue();
						}
					},
					cancel() {
						watcher.close();
					},
				});

				return new Response(body, {
					headers: {
						"Content-Type": "text/event-stream",
					},
				});
			}

			headers.push("Cache-Control: no-store");
		} else {
			const fingerprinted = Path.extname(
				Path.basename(url.pathname, Path.extname(url.pathname)),
			) !== "";

			if (fingerprinted) {
				headers.push("Cache-Control: public, max-age=31536000, immutable");
			}
		}

		let response: Response | undefined = await serveDir(req, {
			fsRoot: "dist",
			headers,
		});

		if (response.status === 404) {
			response = await tryViews(200, url);

			if (response) return response;

			response = await tryViews(404, url);

			if (response) return response;
		}

		return response;
	};

	async function tryViews(status, url) {
		for (const view of config.views) {
			if (
				((view.status ?? 200) == status) && view.pattern.test(url)
			) {
				const match = view.pattern.exec(url);
				let body = await view.serve.call(
					{ urls: config.urls },
					match.pathname.groups,
				);

				if (typeof body !== "string") {
					const { promise, resolve } = Promise.withResolvers<string>();

					effect(() => {
						resolve(`<!doctype html>${render(body.deref())}`);
					});

					body = await promise;
				}

				return new Response(body, {
					status: 200,
					headers: {
						"Content-Type": view.contentType ?? "text/html",
					},
				});
			}
		}
	}
}
