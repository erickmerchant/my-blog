import * as Path from "@std/path";
import { effect, render } from "handcraft/env/server.js";
import { serveDir } from "@std/http/file-server";

export default function (
	{
		routes,
		urls = new Proxy({}, {
			get(_, key) {
				return key;
			},
		}),
		notFound,
	}: Config,
) {
	const distDir = Path.join(Deno.cwd(), "dist");

	return async (req: Request) => {
		const url = new URL(req.url);
		const headers: Array<string> = [];
		const fingerprinted = Path.extname(
			Path.basename(url.pathname, Path.extname(url.pathname)),
		) !== "";

		if (fingerprinted) {
			headers.push("Cache-Control: public, max-age=31536000, immutable");
		}

		const response: Response | undefined = await serveDir(req, {
			fsRoot: Path.join(distDir, "public"),
			headers,
			quiet: true,
		});

		if (response.status === 404) {
			for (const route of routes) {
				const pattern = route.pattern instanceof URLPattern
					? route.pattern
					: new URLPattern({ pathname: route.pattern });

				if (pattern.test(url)) {
					const match = pattern.exec(url);

					if (!match) continue;

					const body = await callRoute(route, urls, match.pathname.groups);

					return new Response(body, {
						status: 200,
						headers: {
							"Content-Type": route.contentType ?? "text/html",
						},
					});
				}
			}
		}

		if (response.status === 404) {
			const body: string = await Deno.readTextFile(
				Path.join(distDir, "public/404.html"),
			).catch(() => callRoute(notFound, urls));

			return new Response(body, {
				status: 404,
				headers: {
					"Content-Type": "text/html",
				},
			});
		}

		return response;
	};
}

export async function callRoute(
	route: { handler: RouteHandler },
	urls: Record<string, string>,
	params?: Record<string, any>,
) {
	let body: any = await route.handler({ params, urls });

	if (typeof body !== "string") {
		const { promise, resolve } = Promise.withResolvers<string>();

		effect(() => {
			resolve(`<!doctype html>${render(body.deref())}`);
		});

		body = await promise;
	}

	return body ?? "";
}
