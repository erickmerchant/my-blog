import {h, unsafe} from "../h.js";
import base from "./base.js";

const {section, h1, h2, p, ol, ul, li, a, aside, link} = h.html;

export default function ({site, posts}) {
	return base({
		site,
		navTitle: h1.class("nav-title")(site.title),
		styles: link.rel("stylesheet").href("/home.css"),
		main: [
			posts.length
				? section.class("section")(
						h2("Posts"),
						ol.class("section-list")(
							posts.map((post) =>
								li.class("section-item")(
									a.class("title").href("/posts/" + post.slug + "/")(post.title)
								)
							)
						)
				  )
				: null,
			site.projects.length
				? section.class("section")(
						h2("Projects"),
						p("Some open-source projects."),
						ul.class("section-list")(
							site.projects.map((project) =>
								li.class("section-item")(
									a.class("title").href(project.href)(project.title),
									unsafe(project.description)
								)
							)
						)
				  )
				: null,
			aside.class("section")(h2("About"), unsafe(site.bio)),
		],
	});
}
