import { h } from "handcraft/env/server.js";
import { asLocalDate } from "../utils/dates.ts";
import * as Markdown from "../utils/markdown.ts";
import page from "./page.js";
import { getSite } from "../models/site.ts";
import { getPublishedPosts } from "../models/post.ts";

const { link, article, header, h1, time, span } = h.html;

export default {
	pattern: new URLPattern({ pathname: "/posts/:slug/" }),
	async serve({ slug }) {
		const site = await getSite();
		const posts = await getPublishedPosts();
		const post = posts.find((post) => post.slug === slug);

		return page({
			site,
			pageTitle: post.title,
			styles: [
				link.rel("stylesheet").href(this.urls["/post.css"]),
				link.rel("stylesheet").href(this.urls["/prism.css"]),
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
	},
};
