import * as Path from "@std/path";
import { serveDir } from "@std/http/file-server";

export default {
	fetch(req: Request) {
		const url = new URL(req.url);

		if (!Deno.args.includes("--dev")) {
			const hasHash = Path.extname(
				Path.basename(url.pathname, Path.extname(url.pathname)),
			) !== "";
			const headers: Array<string> = [];

			if (hasHash) {
				headers.push("Cache-Control: public, max-age=31536000, immutable");
			}

			return serveDir(req, {
				fsRoot: "dist",
				headers,
			});
		}

		return serveDir(req, {
			fsRoot: "dist",
		});
	},
};
