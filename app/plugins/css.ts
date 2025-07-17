import * as Fs from "@std/fs";
import * as Path from "@std/path";
import * as LightningCSS from "lightningcss";
import { urls } from "../build.ts";

export async function plugin(path: string, content: Uint8Array<ArrayBuffer>) {
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
