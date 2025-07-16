import { h } from "handcraft/env/server.js";
import page from "./page.js";
import * as Markdown from "../utils/markdown.ts";
import { getUrl } from "../build.ts";

const { section, h1, h2, p, ol, ul, li, a, aside, link } = h.html;

export default async function ({ site, posts }) {
	return page({
		site,
		navTitle: h1.class("nav-title")(site.title),
		styles: link.rel("stylesheet").href(getUrl("/home.css")),
		main: [
			posts.length
				? section.class("section")(
					h2("Posts"),
					ol.class("section-list")(
						posts.map((post) =>
							li.class("section-item")(
								a.class("title").href("/posts/" + post.slug + "/")(post.title),
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
	});
}
