import { h } from "handcraft/env/server.js";

const { link } = h.html;

export default function (_, resolve) {
	return [
		link
			.rel("icon")
			.href(resolve("/favicon-light.png"))
			.type("image/svg+xml")
			.media("(prefers-color-scheme: light)"),
		link
			.rel("icon")
			.href(resolve("/favicon-dark.png"))
			.type("image/svg+xml")
			.media("(prefers-color-scheme: dark)"),
	];
}
