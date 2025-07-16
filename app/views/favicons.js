import { h } from "handcraft/env/server.js";
import { getUrl } from "../build.ts";

const { link } = h.html;

export default function () {
	return [
		link
			.rel("icon")
			.href(getUrl("/favicon-light.png"))
			.type("image/svg+xml")
			.media("(prefers-color-scheme: light)"),
		link
			.rel("icon")
			.href(getUrl("/favicon-dark.png"))
			.type("image/svg+xml")
			.media("(prefers-color-scheme: dark)"),
	];
}
