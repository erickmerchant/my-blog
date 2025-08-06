import { h } from "handcraft/env/server.js";
import { getSite } from "../models/site.ts";
import page from "./page.js";

const { link, article, h1, p } = h.html;

export default async function ({ resolve }) {
  const site = await getSite();

  return page({
    site,
    pageTitle: "404 Not Found",
    styles: link.rel("stylesheet").href(resolve("/post.css")),
    main: article.class("article")(
      h1("404 Not Found"),
      p("The thing you're looking for can not be located."),
    ),
    resolve,
  });
}
