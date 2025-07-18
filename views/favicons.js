import { h } from "handcraft/env/server.js";

const { link } = h.html;

export default function ({ urls }) {
	return [
		link
			.rel("icon")
			.href(urls["/favicon-light.png"])
			.type("image/svg+xml")
			.media("(prefers-color-scheme: light)"),
		link
			.rel("icon")
			.href(urls["/favicon-dark.png"])
			.type("image/svg+xml")
			.media("(prefers-color-scheme: dark)"),
	];
}
