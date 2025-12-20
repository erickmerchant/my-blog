import { h } from "@handcraft/lib";
import { getSite } from "../models/site.ts";
import page from "./page.ts";

const { link, article, h1, p } = h.html;

export default async function () {
  const site = await getSite();

  return page({
    site,
    pageTitle: "404 Not Found",
    stylesheet: link.rel("stylesheet").href("/styles/post.css"),
    mainContent: [
      article.class("article")(
        h1("404 Not Found"),
        p("The thing you're looking for can not be located."),
      ),
    ],
  });
}
