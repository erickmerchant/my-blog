import { h } from "handcraft/env/server.js";
import { asLocalDate } from "../utils/dates.ts";
import * as Markdown from "../utils/markdown.ts";
import page from "./page.js";
import { getSite } from "../models/site.ts";
import { getPostBySlug } from "../models/post.ts";

const { link, article, header, h1, time, span } = h.html;

export default async function ({ params: { slug }, resolve }) {
	const site = await getSite();
	const post = await getPostBySlug(slug);

	return page({
		site,
		pageTitle: post.title,
		styles: [
			link.rel("stylesheet").href(resolve("/post.css")),
			link.rel("stylesheet").href(resolve("/prism.css")),
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
		resolve,
	});
}
