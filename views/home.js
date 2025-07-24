import { h } from "handcraft/env/server.js";
import page from "./page.js";
import * as Markdown from "../utils/markdown.ts";
import { getSite } from "../models/site.ts";
import { getPublishedPosts } from "../models/post.ts";

const { section, h1, h2, p, ol, ul, li, a, aside, link } = h.html;

export default async function (_, resolve) {
	const site = await getSite();
	const posts = await getPublishedPosts();

	return page({
		site,
		bannerTitle: h1.class("banner-title")(site.title),
		styles: link.rel("stylesheet").href(resolve("/home.css")),
		main: [
			posts.length
				? section.class("section")(
					h2("Posts"),
					ol.class("section-list")(
						posts.map((post) =>
							li.class("section-item")(
								a.class("title").href("/posts/" + post.slug + "/")(
									post.title,
								),
							)
						),
					),
				)
				: null,
			site.projects.length
				? section.class("section")(
					h2("Projects"),
					p("Some open-source projects."),
					ul.class("section-list")(
						await Promise.all(
							site.projects.map(async (project) =>
								li.class("section-item")(
									a.class("title").href(project.href)(project.title),
									await Markdown.parse(project.description),
								)
							),
						),
					),
				)
				: null,
			aside.class("section")(h2("About"), await Markdown.parse(site.bio)),
		],
	}, resolve);
}
