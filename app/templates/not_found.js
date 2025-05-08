import {h} from "handcraft/prelude/all.js";
import base from "./base.js";

const {link, article, h1, p} = h.html;

export default function ({site}) {
	return base({
		site,
		pageTitle: "404 Not Found",
		styles: link.rel("stylesheet").href("/post.css"),
		main: article.class("article")(
			h1("404 Not Found"),
			p("The thing you're looking for can not be located.")
		),
	});
}
