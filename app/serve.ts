import * as Path from "@std/path";
import { effect, render } from "handcraft/env/server.js";
import { serveDir } from "@std/http/file-server";
// import { debounce } from "@std/async/debounce";

export default function (
	{ routes, urls, dist }: {
		routes: Array<
			{
				status?: number;
				contentType?: string;
				pattern: URLPattern;
				serve: (params: any) => any;
			}
		>;
		urls: Record<string, string>;
		dist?: string;
	},
) {
	return async (req: Request) => {
		const url = new URL(req.url);
		const headers: Array<string> = [];

		// if (dev) {
		// 	if (url.pathname === "/_watch") {
		// 		let watcher: Deno.FsWatcher;
		// 		const body = new ReadableStream({
		// 			async start(controller) {
		// 				const enqueue = debounce(() => {
		// 					controller.enqueue(
		// 						new TextEncoder().encode(
		// 							`data: "change"\r\n\r\n`,
		// 						),
		// 					);
		// 				}, 500);

		// 				watcher = Deno.watchFs(["dist"]);

		// 				for await (const e of watcher) {
		// 					console.log(e.kind, e.paths.join(" "));

		// 					enqueue();
		// 				}
		// 			},
		// 			cancel() {
		// 				watcher.close();
		// 			},
		// 		});

		// 		return new Response(body, {
		// 			headers: {
		// 				"Content-Type": "text/event-stream",
		// 			},
		// 		});
		// 	}

		// 	headers.push("Cache-Control: no-store");
		// } else {
		const fingerprinted = Path.extname(
			Path.basename(url.pathname, Path.extname(url.pathname)),
		) !== "";

		if (fingerprinted) {
			headers.push("Cache-Control: public, max-age=31536000, immutable");
		}
		// }

		let response: Response | undefined = await serveDir(req, {
			fsRoot: Path.join(dist ?? "dist", "public"),
			headers,
		});

		if (response.status === 404) {
			response = await tryRouting(200, url);

			if (response) return response;

			response = await tryRouting(404, url);

			if (response) return response;
		}

		return response;
	};

	async function tryRouting(status: number, url: URL) {
		for (const view of routes) {
			const pattern = view.pattern instanceof URLPattern
				? view.pattern
				: new URLPattern({ pathname: view.pattern });

			if (
				((view.status ?? 200) == status) && pattern.test(url)
			) {
				const match = pattern.exec(url);

				if (!match) continue;

				let body = await view.serve.call(
					{ urls },
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
