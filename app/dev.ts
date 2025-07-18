import * as Path from "@std/path";
import { serveDir } from "@std/http/file-server";
import { debounce } from "@std/async/debounce";
import { callRoute } from "./serve.ts";

const publicDir = Path.join(Deno.cwd(), "public");
const { config } = await import(Path.join(Deno.cwd(), "flint.ts"));
const urls = new Proxy({}, {
	get(_, key) {
		return key;
	},
});

export default {
	async fetch(req: Request) {
		const url = new URL(req.url);

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

					watcher = Deno.watchFs(config.watch);

					for await (const e of watcher) {
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

		const response: Response | undefined = await serveDir(req, {
			fsRoot: publicDir,
			headers: ["Cache-Control: no-store"],
			quiet: true,
		});

		if (response.status === 404) {
			for (const route of config.routes) {
				const pattern = route.pattern instanceof URLPattern
					? route.pattern
					: new URLPattern({ pathname: route.pattern });

				if (pattern.test(url)) {
					const match = pattern.exec(url);

					if (!match) continue;

					let body = await callRoute(
						route,
						urls,
						match.pathname.groups,
					);

					const contentType = route.contentType ?? "text/html";

					if (contentType === "text/html") {
						body += `<script type="module">
							let esrc = new EventSource("/_watch");

							esrc.addEventListener("message", (e) => {
									window.location.reload()
							});
						</script>
						`;
					}

					return new Response(body, {
						status: 200,
						headers: {
							"Content-Type": contentType,
						},
					});
				}
			}
		} else {
			for (const plugin of config.plugins) {
				const pattern = plugin.pattern instanceof URLPattern
					? plugin.pattern
					: new URLPattern({ pathname: plugin.pattern });
				if (pattern.test(url)) {
					let content = await response.bytes();

					content = await plugin.handler({
						path: Path.join(publicDir, url.pathname),
						content,
						urls,
					});

					return new Response(content, { ...response });
				}
			}
		}

		if (response.status === 404) {
			const body: string = await callRoute(config.notFound, urls);

			return new Response(body, {
				status: 404,
				headers: {
					"Content-Type": "text/html",
				},
			});
		}

		return response;
	},
};
