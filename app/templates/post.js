import {h, unsafe} from "handcraft/prelude/all.js";
import base from "./base.js";
import {asLocalDate} from "../utils/dates.ts";

const {link, article, header, h1, time, span} = h.html;

export default function ({site, post}) {
	return base({
		site,
		pageTitle: post.title,
		styles: [
			link.rel("stylesheet").href("/post.css"),
			post.components.includes("code") &&
				link.rel("stylesheet").href("/code.css"),
			post.components.includes("highlighting") &&
				link.rel("stylesheet").href("/prism.css"),
		],
		main: article.class("article")(
			header(
				h1(post.title),
				post.datePublished
					? time.class("status")(asLocalDate(post.datePublished))
					: span.class("status")("Draft")
			),
			unsafe(post.content)
		),
	});
}
