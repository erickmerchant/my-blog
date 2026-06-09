import { h } from "@handcraft/lib";
import { getSite } from "../models/site.ts";
import page from "./page.ts";

const { article, h1 } = h.html;

export default async function () {
  const site = await getSite();

  return page({
    site,
    pageTitle: "404 Not Found",
    mainContent: [
      article.class("post")(
        h1("404 Not Found"),
        ...site.unfound,
      ),
    ],
  });
}
