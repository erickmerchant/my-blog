import * as Path from "@std/path";
import * as LightningCSS from "lightningcss";

export default function (
	path: string,
	content: Uint8Array<ArrayBuffer>,
	urls: Record<string, string>,
) {
	const { code } = LightningCSS.transform({
		filename: path,
		code: content,
		minify: true,
		sourceMap: false,
		visitor: {
			Url(url) {
				return {
					...url,
					url: urls[Path.resolve(path, url.url)],
				};
			},
		},
	});

	return code;
}
