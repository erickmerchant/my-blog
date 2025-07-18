import * as Path from "@std/path";
import * as LightningCSS from "lightningcss";

export default function (
	{ path, content, urls }: PluginParams,
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
