import { h } from "handcraft/env/server.js";
import page from "./page.js";
import { asLocalDate } from "../utils/dates.ts";
import * as Markdown from "../utils/markdown.ts";
import { getUrl } from "../build.ts";

const { link, article, header, h1, time, span } = h.html;

export default async function ({ site, post }) {
	return page({
		site,
		pageTitle: post.title,
		styles: [
			link.rel("stylesheet").href(getUrl("/post.css")),
			link.rel("stylesheet").href(getUrl("/prism.css")),
		],
		main: article.class("article")(
			header(
				h1(post.title),
				post.datePublished
					? time.class("status")(asLocalDate(post.datePublished))
					: span.class("status")("Draft"),
			),
			await Markdown.parse(post.content),
		),
	});
}
