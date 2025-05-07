import { h } from "../h.ts";
import base from "./base.ts";

const { link, article, h1, p } = h.html;

type Props = {
  site: Site;
};

export default function ({ site }: Props) {
  return base({
    site,
    pageTitle: "404 Not Found",
    styles: link.rel("stylesheet").href("/post.css"),
    main: article.class("article")(
      h1("404 Not Found"),
      p("The thing you're looking for can not be located."),
    ),
  });
}
