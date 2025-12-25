import { fragment, h } from "@handcraft/lib";
import { getSite } from "../models/site.ts";
import page from "./page.ts";
import * as Markdown from "../utils/markdown.ts";

const { link, article, h1 } = h.html;

export default async function () {
  const site = await getSite();

  return page({
    site,
    pageTitle: "404 Not Found",
    stylesheet: link.rel("stylesheet").href("/styles/post.css"),
    mainContent: [
      article.class("article")(
        h1("404 Not Found"),
        fragment.html(
          await Markdown.parse(
            "The page you're looking doesn't exist. Check the [home page](/) for currently supported pages.",
          ),
        ),
      ),
    ],
  });
}
