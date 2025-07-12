import {h} from "handcraft/env/server.js";
import base from "./base.js";
import {getUrl} from "../main.ts";

const {link, article, h1, p} = h.html;

export default function ({site}) {
	return base({
		site,
		pageTitle: "404 Not Found",
		styles: link.rel("stylesheet").href(getUrl("/post.css")),
		main: article.class("article")(
			h1("404 Not Found"),
			p("The thing you're looking for can not be located.")
		),
	});
}
