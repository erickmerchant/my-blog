import * as Path from "@std/path";
import { serveDir } from "@std/http/file-server";
import { debounce } from "@std/async/debounce";

export default {
	async fetch(req: Request) {
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

		const response = await serveDir(req, {
			fsRoot: "dist",
			headers,
		});

		if (response.status === 404) {
			const body = await Deno.readTextFile("./dist/404.html").catch(() => null);

			if (body != null) {
				return new Response(body, {
					status: 404,
					headers: {
						"Content-Type": "text/html",
					},
				});
			}
		}

		return response;
	},
};
