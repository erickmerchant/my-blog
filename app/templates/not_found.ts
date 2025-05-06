import { html } from "handcraft/prelude/all.js";
import base from "./base.ts";

const { link, article, h1, p } = html;

type Props = {
  site: Site;
};

export default function ({ site }: Props) {
  return base({
    site,
    pageTitle: "404 Not Found",
    styles: link().attr("rel", "stylesheet").attr("href", "/post.css"),
    main: article().classes("article").append(
      h1().text("404 Not Found"),
      p().text("The thing you're looking for can not be located."),
    ),
  });
}
